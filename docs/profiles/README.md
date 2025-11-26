# Profile Management

VPN profile/server configuration management including import, storage, and switching.

## Features

- Import VPN configurations (.conf for WireGuard, .ovpn for OpenVPN)
- Manual server entry with connection details
- Profile editing and deletion
- Quick profile switching
- Profile organization (favorites, groups, recent)
- Secure credential storage (macOS Keychain)

## Profile Structure

### WireGuard Profile
```
[Interface]
PrivateKey = <key>
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = <key>
Endpoint = vpn.example.com:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

### OpenVPN Profile
```
client
dev tun
proto udp
remote vpn.example.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca ca.crt
cert client.crt
key client.key
cipher AES-256-CBC
auth SHA256
```

## Storage

Profiles stored in:
- **macOS**: `~/Library/Application Support/VPN-Client/profiles/`
- **Windows**: `%APPDATA%/VPN-Client/profiles/`
- **Linux**: `~/.config/vpn-client/profiles/`

Credentials stored separately in:
- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: Secret Service API (libsecret)

## Implementation Details

### Go Backend Service
- `profiles/manager.go` - Profile CRUD operations
- `profiles/parser.go` - Configuration file parsing
- `profiles/storage.go` - File system operations
- `profiles/credentials.go` - Secure credential handling

### API Endpoints
- `GET /api/profiles` - List all profiles
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/import` - Import configuration file

## Security Considerations

- Never store private keys in plaintext
- Use OS-native credential storage
- Sanitize imported configuration files
- Validate all profile data before saving

## Related Documentation

- [Connection](../connection/) - Using profiles to establish connections
- [UI](../ui/) - Profile management interface
- [Platform Integration](../platform-integration/) - OS-specific credential storage
