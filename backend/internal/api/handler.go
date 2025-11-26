package api

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/vpn-client-app/backend/internal/connection"
	"github.com/vpn-client-app/backend/internal/profile"
	"github.com/vpn-client-app/backend/internal/shared/version"
	"go.uber.org/zap"
)

type Handler struct {
	logger      *zap.Logger
	upgrader    websocket.Upgrader
	connManager *connection.Manager
	profManager *profile.Manager
}

func NewHandler(logger *zap.Logger) *Handler {
	return &Handler{
		logger: logger,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
		connManager: connection.NewManager(),
		profManager: profile.NewManager(),
	}
}

func (h *Handler) RegisterRoutes(router *mux.Router) {
	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()
	
	// Health check
	api.HandleFunc("/health", h.handleHealth).Methods("GET")
	
	// Connection endpoints
	api.HandleFunc("/connections", h.handleGetConnections).Methods("GET")
	api.HandleFunc("/connections/{id}/connect", h.handleConnect).Methods("POST")
	api.HandleFunc("/connections/{id}/disconnect", h.handleDisconnect).Methods("POST")
	
	// Profile endpoints
	api.HandleFunc("/profiles", h.handleGetProfiles).Methods("GET")
	api.HandleFunc("/profiles", h.handleCreateProfile).Methods("POST")
	api.HandleFunc("/profiles/{id}", h.handleGetProfile).Methods("GET")
	api.HandleFunc("/profiles/{id}", h.handleUpdateProfile).Methods("PUT")
	api.HandleFunc("/profiles/{id}", h.handleDeleteProfile).Methods("DELETE")
	
	// WebSocket for real-time updates
	api.HandleFunc("/ws", h.handleWebSocket)
}

type HealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
}

func (h *Handler) handleHealth(w http.ResponseWriter, r *http.Request) {
	h.respondJSON(w, HealthResponse{Status: "ok", Version: version.Version})
}

func (h *Handler) handleGetConnections(w http.ResponseWriter, r *http.Request) {
	list := h.connManager.List()
	h.respondJSON(w, list)
}

type connectRequest struct {
	ProfileID string `json:"profileId"`
}

func (h *Handler) handleConnect(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	body, _ := io.ReadAll(r.Body)
	var req connectRequest
	_ = json.Unmarshal(body, &req)
	if req.ProfileID == "" {
		h.respondError(w, http.StatusBadRequest, "profileId required")
		return
	}
	c, _ := h.connManager.Connect(id, req.ProfileID)
	h.logger.Info("connection_connect", zap.String("id", id), zap.String("profileId", req.ProfileID))
	h.respondJSON(w, c.ToDTO())
}

func (h *Handler) handleDisconnect(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	c, _ := h.connManager.Disconnect(id)
	h.logger.Info("connection_disconnect", zap.String("id", id))
	if c == nil {
		h.respondError(w, http.StatusNotFound, "not found")
		return
	}
	h.respondJSON(w, c.ToDTO())
}

func (h *Handler) handleGetProfiles(w http.ResponseWriter, r *http.Request) {
	h.respondJSON(w, h.profManager.List())
}

func (h *Handler) handleCreateProfile(w http.ResponseWriter, r *http.Request) {
	var req profile.CreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, http.StatusBadRequest, "invalid json")
		return
	}
	p, err := h.profManager.Create(req)
	if err != nil {
		h.respondError(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	w.WriteHeader(http.StatusCreated)
	h.respondJSON(w, p)
}

func (h *Handler) handleGetProfile(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	p := h.profManager.Get(id)
	if p == nil {
		h.respondError(w, http.StatusNotFound, "not found")
		return
	}
	h.respondJSON(w, p)
}

func (h *Handler) handleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	var req profile.UpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.respondError(w, http.StatusBadRequest, "invalid json")
		return
	}
	p, err := h.profManager.Update(id, req)
	if err != nil {
		h.respondError(w, http.StatusNotFound, err.Error())
		return
	}
	h.respondJSON(w, p)
}

func (h *Handler) handleDeleteProfile(w http.ResponseWriter, r *http.Request) {
	id := mux.Vars(r)["id"]
	if !h.profManager.Delete(id) {
		h.respondError(w, http.StatusNotFound, "not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.logger.Error("ws_upgrade_failed", zap.Error(err))
		return
	}
	defer conn.Close()
	h.logger.Info("ws_connected")
	for {
		mt, msg, err := conn.ReadMessage()
		if err != nil {
			h.logger.Error("ws_read_error", zap.Error(err))
			break
		}
		if err := conn.WriteMessage(mt, msg); err != nil {
			h.logger.Error("ws_write_error", zap.Error(err))
			break
		}
	}
}

// Helpers
func (h *Handler) respondJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}
func (h *Handler) respondError(w http.ResponseWriter, status int, msg string) {
	w.WriteHeader(status)
	h.respondJSON(w, map[string]string{"error": msg})
}
