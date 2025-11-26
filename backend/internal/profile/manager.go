package profile

import (
	"errors"
	"sync"
	"time"
)

type Manager struct {
	mu       sync.RWMutex
	profiles map[string]*Profile
}

func NewManager() *Manager {
	return &Manager{profiles: make(map[string]*Profile)}
}

func (m *Manager) List() []*Profile {
	m.mu.RLock()
	defer m.mu.RUnlock()
	out := make([]*Profile, 0, len(m.profiles))
	for _, p := range m.profiles {
		out = append(out, p)
	}
	return out
}

func (m *Manager) Get(id string) *Profile {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.profiles[id]
}

func (m *Manager) Create(req CreateRequest) (*Profile, error) {
	if req.Name == "" || req.Type == "" {
		return nil, errors.New("name and type required")
	}
	id := generateID()
	p := &Profile{ID: id, Name: req.Name, Type: req.Type, Config: req.Config}
	m.mu.Lock()
	m.profiles[id] = p
	m.mu.Unlock()
	return p, nil
}

func (m *Manager) Update(id string, req UpdateRequest) (*Profile, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	p := m.profiles[id]
	if p == nil {
		return nil, errors.New("not found")
	}
	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Config != nil {
		p.Config = *req.Config
	}
	return p, nil
}

func (m *Manager) Delete(id string) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	if _, ok := m.profiles[id]; ok {
		delete(m.profiles, id)
		return true
	}
	return false
}

func generateID() string { return time.Now().Format("20060102150405.000000000") }
