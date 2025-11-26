package connection

import (
	"sync"
	"time"
)

type Manager struct {
	mu          sync.RWMutex
	connections map[string]*Connection
}

func NewManager() *Manager {
	return &Manager{connections: make(map[string]*Connection)}
}

func (m *Manager) List() []ConnectionDTO {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]ConnectionDTO, 0, len(m.connections))
	for _, c := range m.connections {
		out = append(out, c.ToDTO())
	}
	return out
}

func (m *Manager) Get(id string) *Connection {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.connections[id]
}

func (m *Manager) Ensure(id, profileID string) *Connection {
	m.mu.Lock()
	defer m.mu.Unlock()
	c := m.connections[id]
	if c == nil {
		c = &Connection{ID: id, ProfileID: profileID, State: "disconnected"}
		m.connections[id] = c
	}
	return c
}

func (m *Manager) Connect(id, profileID string) (*Connection, error) {
	c := m.Ensure(id, profileID)
	m.mu.Lock()
	c.State = "connecting"
	m.mu.Unlock()
	// Simulate instant success for now.
	m.mu.Lock()
	c.State = "connected"
	c.StartedAt = time.Now()
	m.mu.Unlock()
	return c, nil
}

func (m *Manager) Disconnect(id string) (*Connection, error) {
	m.mu.Lock()
	c := m.connections[id]
	if c == nil {
		m.mu.Unlock()
		return nil, nil
	}
	c.State = "disconnecting"
	// Simulate immediate disconnect
	c.State = "disconnected"
	m.mu.Unlock()
	return c, nil
}
