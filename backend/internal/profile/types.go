package profile

// Profile represents a VPN configuration profile (simplified).
type Profile struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type"` // wireguard | openvpn
	Config   string `json:"config"` // raw config text (placeholder)
}

// CreateRequest payload for profile creation.
type CreateRequest struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Config string `json:"config"`
}

// UpdateRequest payload for profile update.
type UpdateRequest struct {
	Name   *string `json:"name"`
	Config *string `json:"config"`
}
