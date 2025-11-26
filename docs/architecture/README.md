# Architecture

Overall system architecture, component design, and technical decisions for the VPN client application.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Electron GUI (TypeScript/React)              │   │
│  │  • Menu bar/system tray integration                  │   │
│  │  • Profile management UI                             │   │
│  │  • Settings and logs viewer                          │   │
│  │  • Connection status display                         │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          │ IPC (Unix Socket / HTTP API)
                          │
┌─────────────────────────▼──────────────────────────────────┐
│                  Backend Service Layer (Go)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Connection  │  │   Profile    │  │   Network    │     │
│  │   Manager    │  │   Manager    │  │   Manager    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐   │
│  │              API Server (HTTP/gRPC)                 │   │
│  └────────────────────────┬────────────────────────────┘   │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────┐   │
│  │         VPN Protocol Implementation Layer           │   │
│  │  ┌──────────────────┐    ┌──────────────────┐      │   │
│  │  │  WireGuard-go    │    │  OpenVPN Client  │      │   │
│  │  └──────────────────┘    └──────────────────┘      │   │
│  └────────────────────────┬────────────────────────────┘   │
└───────────────────────────┼────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│              System Integration Layer                       │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────┐  │
│  │  TUN/TAP       │  │   Routing      │  │  Firewall   │  │
│  │  Interface     │  │   Tables       │  │   Rules     │  │
│  └────────────────┘  └────────────────┘  └─────────────┘  │
│                                                             │
│  Platform-Specific Implementations:                        │
│  • macOS: Network Extension, pf, Keychain                  │
│  • Windows: WinTUN, WFP, Credential Manager                │
│  • Linux: TUN/TAP, iptables/nftables, libsecret            │
└─────────────────────────────────────────────────────────────┘
```

## Component Design

### 1. GUI Layer (Electron)

**Responsibilities:**
- User interaction and display
- Configuration management UI
- Status monitoring and notifications
- IPC communication with backend

**Technology Stack:**
- Electron 28+
- React 18+
- TypeScript 5+
- TailwindCSS for styling

**Key Files:**
- `gui/src/main/index.ts` - Electron main process
- `gui/src/renderer/App.tsx` - Main React app
- `gui/src/main/ipc.ts` - IPC handlers
- `gui/src/main/tray.ts` - System tray integration

### 2. Backend Service (Go)

**Responsibilities:**
- VPN connection lifecycle management
- Profile storage and retrieval
- Network configuration
- System-level operations
- Credential management

**Technology Stack:**
- Go 1.21+
- WireGuard-go
- Platform-specific libraries (macOS: NetworkExtension, etc.)

**Project Structure:**
```
backend/
├── cmd/
│   └── vpn-service/      # Main service entry point
├── internal/
│   ├── connection/       # Connection management
│   ├── profile/          # Profile CRUD
│   ├── network/          # Network configuration
│   ├── api/              # HTTP/gRPC API server
│   └── platform/         # OS-specific implementations
├── pkg/
│   ├── wireguard/        # WireGuard integration
│   └── openvpn/          # OpenVPN integration
└── go.mod
```

### 3. Communication Layer

**IPC Mechanism:**
- Unix domain socket (macOS/Linux)
- Named pipe (Windows)
- HTTP/gRPC API over localhost

**API Design:**
```
GET    /api/status           - Current connection status
POST   /api/connect          - Initiate connection
POST   /api/disconnect       - Terminate connection
GET    /api/profiles         - List all profiles
POST   /api/profiles         - Create profile
PUT    /api/profiles/:id     - Update profile
DELETE /api/profiles/:id     - Delete profile
GET    /api/logs             - Retrieve logs
GET    /api/settings         - Get settings
PUT    /api/settings         - Update settings
```

**WebSocket for Real-time Updates:**
```
ws://localhost:8080/ws
→ {"type": "status", "data": {"state": "connected", ...}}
→ {"type": "log", "data": {"message": "...", "level": "info"}}
```

## Data Flow

### Connection Flow
```
User clicks "Connect"
    │
    ▼
Electron GUI sends IPC message
    │
    ▼
Backend API receives request
    │
    ▼
Connection Manager validates profile
    │
    ▼
Protocol Handler (WG/OpenVPN) initializes
    │
    ▼
System Integration creates TUN interface
    │
    ▼
Routing tables updated
    │
    ▼
DNS configuration applied
    │
    ▼
Kill switch enabled (if configured)
    │
    ▼
Status update sent to GUI via WebSocket
    │
    ▼
GUI displays "Connected" state
```

### Profile Import Flow
```
User selects .conf/.ovpn file
    │
    ▼
Electron reads file content
    │
    ▼
Backend API receives file data
    │
    ▼
Profile Parser validates and parses
    │
    ▼
Credentials extracted to secure storage
    │
    ▼
Profile metadata saved to filesystem
    │
    ▼
Profile list updated
    │
    ▼
GUI refreshes profile list
```

## Security Architecture

### Privilege Separation

**GUI Process (User Privileges):**
- Handles all user interaction
- No direct system access
- Communicates with backend via IPC

**Backend Service (Elevated Privileges):**
- Runs as system service/daemon
- Has necessary permissions for:
  - Network interface creation
  - Routing table modification
  - Firewall rule management
  - System configuration

### Credential Security

**Storage:**
- macOS: Keychain with `kSecAttrAccessibleWhenUnlocked`
- Windows: Credential Manager with user-specific credentials
- Linux: Secret Service with encryption at rest

**Transmission:**
- Never send credentials through IPC in plaintext
- Use credential IDs/references
- Backend retrieves from secure storage when needed

### Code Signing & Verification

- All binaries signed with valid certificates
- macOS: Notarized and stapled
- Windows: Authenticode signed
- Verify signatures before execution

## Deployment Architecture

### Distribution Package Structure

**macOS (.pkg installer):**
```
VPN-Client-Installer.pkg
├── VPN Client.app/
│   ├── Contents/
│   │   ├── MacOS/
│   │   │   └── VPN Client           # Electron GUI
│   │   ├── Library/
│   │   │   └── SystemExtensions/
│   │   │       └── VPNExtension.systemextension
│   │   └── Resources/
│   └── Install Scripts/
│       └── postinstall               # Install daemon
└── usr/local/bin/
    └── vpn-service                   # Go backend
```

**Windows (.msi installer):**
```
VPN-Client-Setup.msi
├── Program Files/
│   └── VPN Client/
│       ├── VPN Client.exe            # Electron GUI
│       ├── vpn-service.exe           # Go backend
│       └── resources/
└── Install Actions
    └── Install Windows Service
```

**Linux (.deb/.rpm):**
```
vpn-client_1.0.0_amd64.deb
├── usr/
│   ├── bin/
│   │   └── vpn-client                # Electron GUI
│   └── local/bin/
│       └── vpn-service               # Go backend
├── etc/systemd/system/
│   └── vpn-client.service
└── usr/share/applications/
    └── vpn-client.desktop
```

## Performance Considerations

### Resource Usage Targets
- **RAM**: <200MB GUI + <100MB backend (idle)
- **CPU**: <5% during connection, <1% when connected
- **Startup Time**: <2s for GUI, <1s for backend
- **Connection Time**: <3s for WireGuard, <5s for OpenVPN

### Optimization Strategies
- Lazy load GUI components
- Connection pooling for API requests
- Efficient state management (avoid re-renders)
- Background service remains lightweight
- Batch logging and disk writes

## Scalability Considerations

### Multi-Connection Support (Future)
- Support multiple simultaneous VPN connections
- Per-connection state tracking
- Resource isolation between connections

### Plugin Architecture (Future)
- Support for additional VPN protocols
- Custom DNS resolvers
- Traffic inspection/filtering plugins

## Error Handling & Recovery

### Error Categories
1. **Network Errors** - Connection timeouts, DNS failures
2. **Authentication Errors** - Invalid credentials, expired keys
3. **System Errors** - Permission denied, resource unavailable
4. **Configuration Errors** - Invalid profile, missing parameters

### Recovery Strategies
- Auto-reconnect with exponential backoff
- Fallback DNS servers
- Kill switch remains active during errors
- Graceful degradation (OpenVPN fallback if WireGuard fails)

## Logging & Monitoring

### Log Levels
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARN**: Warning messages (non-critical issues)
- **ERROR**: Error messages (operation failures)

### Log Storage
- macOS: `~/Library/Logs/VPN-Client/`
- Windows: `%APPDATA%/VPN-Client/logs/`
- Linux: `~/.local/share/vpn-client/logs/`

### Log Rotation
- Max file size: 10MB
- Keep last 5 log files
- Compress old logs

## Testing Strategy

### Unit Tests
- Go backend: `go test ./...`
- TypeScript: Jest + React Testing Library

### Integration Tests
- API endpoint testing
- IPC communication testing
- Profile import/export testing

### End-to-End Tests
- Electron spectron/playwright
- Full connection workflow
- GUI interaction testing

### Platform Testing
- Test matrix: macOS 11-14, Windows 10/11, Ubuntu 20.04/22.04
- Automated CI/CD pipeline (GitHub Actions)

## Related Documentation

- [Connection](../connection/) - Connection management details
- [Profiles](../profiles/) - Profile structure and management
- [Network](../network/) - Network configuration implementation
- [UI](../ui/) - User interface design
- [Platform Integration](../platform-integration/) - OS-specific implementations
