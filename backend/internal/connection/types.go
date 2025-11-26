package connection

import "time"

// Connection represents a VPN connection instance in memory.
type Connection struct {
	ID        string
	ProfileID string
	State     string // disconnected, connecting, connected, disconnecting, error
	StartedAt time.Time
}

// DTO returned via API.
type ConnectionDTO struct {
	ID            string `json:"id"`
	ProfileID     string `json:"profileId"`
	State         string `json:"state"`
	UptimeSeconds int64  `json:"uptimeSeconds"`
}

func (c *Connection) ToDTO() ConnectionDTO {
	var up int64
	if !c.StartedAt.IsZero() && c.State == "connected" {
		up = time.Since(c.StartedAt).Seconds()
	}
	return ConnectionDTO{ID: c.ID, ProfileID: c.ProfileID, State: c.State, UptimeSeconds: up}
}
