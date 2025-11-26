# Copilot Instructions: VPN Client App

Purpose: Make AI agents immediately productive across backend (Go), GUI (Electron/React), and infra tooling. Focus on current implemented code (early alpha) and documented architecture.

## Core Architecture (Backend Focus Now)
- Entrypoint: `backend/cmd/vpn-service/main.go` sets up Zap logger, Gorilla Mux router, graceful shutdown.
- Version constant: update both `main.go` and API health (`handler.go: HealthResponse.Version`) together.
- API prefix: current implementation uses `/api/v1`; docs show planned endpoints (some differ). Treat unimplemented handlers (TODO blocks) as stubs—extend in same file unless size justifies extracting.
- WebSocket: `handleWebSocket` currently echo-only; future: push status/log events. Preserve upgrader origin check placeholder; add proper origin filtering before production.
- Internal packages (private): `internal/{api,connection,network,profile}` – follow clear single-responsibility; avoid exporting cross-package types unless needed.
- Public protocol packages: `pkg/{wireguard,openvpn}` – keep protocol abstractions here; backend logic should depend on an interface you define here (e.g. `type Tunnel interface { Start(...) error; Stop() error }`).

## Conventions & Patterns
- Logging: Use `zap.Logger` passed into handlers; never use `log.Print` after initialization. Structured fields over interpolated strings.
- JSON Responses: Always set `Content-Type: application/json`; prefer struct types for stable schema (avoid `map[string]string` except trivial status).
- Route Style: Plural nouns: `/profiles`, `/connections`; action subresources: `/connections/{id}/connect`. Maintain consistency.
- Graceful Shutdown: Add cleanup hooks by listening before `srv.Shutdown(ctx)`—extend in `main.go` not inside handlers.
- WebSocket Loop: Non-blocking read/write; when adding pushes, design a fan-out broadcaster rather than writing from multiple goroutines to single conn directly.
- Versioning: Path (`/api/v1`) + payload version field—bump both intentionally; provide backward-compatible window if changing path.

## Adding Features (Examples)
- Connection List: Implement in `handleGetConnections`: fetch from `internal/connection/manager.go` (create if missing) returning slice of `ConnectionDTO` (id, state, uptime, profileId).
- Profile CRUD: Parse request body into `ProfileCreateRequest`; validate required fields (e.g. WireGuard keys) before persisting. Store secure credentials via platform-specific helper (future `internal/profile/credentials.go`).
- Health Extensions: Add fields (`uptimeSeconds`, `timestamp`) to `HealthResponse`; keep backward compatibility by only appending fields.

## Data & State Flow (Planned Adaptations)
- GUI ↔ Backend: IPC/HTTP calls to REST + WebSocket stream. Maintain separation: no GUI-specific types leaking into Go; expose generic JSON-friendly structs only.
- Connection Lifecycle: Implement a state machine in `internal/connection` (files: `state.go`, `manager.go` per docs). Use channel + goroutine pattern for transitions; emit events to WebSocket broadcaster.

## Testing Guidance (Backend Current Stage)
- Unit tests: target handlers using `httptest.NewRecorder` + injected logger (`zap.NewNop()`). Avoid global side effects.
- WebSocket test: use `websocket.DefaultDialer.Dial` against test server; assert echo behavior now, extend with event subscription tests later.
- Ensure added tests runnable via `go test -v ./...` from `backend/`.

## Performance & Reliability Hooks (Prepare Early)
- Timeouts already set on server: keep handlers fast (<100ms); offload long operations (protocol start) to background workers + return immediate accepted status.
- Auto-reconnect / backoff: place logic in `internal/connection/reconnect.go`; expose configurable limits via environment variables with sane defaults.

## Environment & Configuration
- Port override: `PORT` env. Do not hardcode alternative port inside handlers; centralize in `main.go`.
- Future protocol config (keys, endpoints): use structured config objects passed to protocol package, never raw maps.

## Logging & Observability Roadmap
- Replace TODO stubs with structured events: `logger.Info("connection_start", zap.String("id", id))` etc.
- Add request tracing middleware (e.g. simple request ID) before expanding features.

## Safe Evolution Rules
1. Keep public surface (`/api/v1` path + existing JSON keys) stable; only additive changes until beta.
2. Introduce new internal packages rather than overloading existing ones when responsibility diverges.
3. Avoid circular dependencies—if shared types grow, create `internal/shared` (still private) instead of moving prematurely to `pkg/`.
4. Never embed secrets in logs; redact keys (display first 6 chars if needed).

## When Implementing Next
- Start with DTO structs (types.go) for a package before handler wiring.
- Add input validation early (reject malformed profile keys; return `422 Unprocessable Entity`).
- For new long-lived components (connection manager), provide a `Start()` and `Stop(ctx)` interface for graceful shutdown integration.

## Quick Reference
- Build backend: `cd backend && go build -o vpn-service ./cmd/vpn-service`
- Run backend dev: `PORT=8080 ./vpn-service`
- Test backend: `cd backend && go test -v ./...`
- Quality scan: `npm run scan` (root, uses `quality-manager.js`)

Feedback: Clarify missing protocol abstractions or desired DTO shapes—list them and request confirmation before broad refactors.
