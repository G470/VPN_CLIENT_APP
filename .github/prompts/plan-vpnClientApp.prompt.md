# Plan: Cross-platform VPN Client App for macOS

Build a user-friendly VPN client targeting macOS users with cross-platform support (Windows/Linux), using Go for the VPN backend and Electron for the GUI, supporting WireGuard and OpenVPN protocols.

## Steps

1. **Set up Go backend service** - Create privileged background service in [new: `backend/`] for VPN connection management, protocol handling (WireGuard/OpenVPN), and system network configuration

2. **Build Electron GUI app** - Develop user interface in [new: `gui/`] with system tray integration, profile management, connection status, and IPC communication to Go backend

3. **Implement WireGuard protocol support** - Integrate wireguard-go library in `backend/` for modern VPN connections with configuration import and connection management

4. **Add macOS system integration** - Configure Network Extension framework, code signing, entitlements, and proper IPC between sandboxed GUI and privileged service

5. **Create basic feature set** - Implement connect/disconnect, profile import (.conf/.ovpn), auto-reconnect, kill switch, and launch-at-startup functionality

## Further Considerations

1. **GUI Framework Choice** - Option A: Electron (faster development, ~150MB) / Option B: Swift native (better UX, smaller size but macOS-only) / Option C: Tauri (compromise between size and cross-platform)?

2. **Distribution Strategy** - Standalone notarized .pkg (more flexibility) or Mac App Store (easier distribution but strict review)? Will need Apple Developer Account ($99/year).

3. **OpenVPN Licensing** - Run as separate GPL-licensed process to avoid open-sourcing entire app, or use OpenVPN3 with different licensing terms?

## Technology Stack Recommendation

**Backend**: Go
- Cross-platform compilation
- Strong VPN library support
- Good performance

**GUI**: 
- **Option A (Faster to market)**: Electron + TypeScript - Richer UI, faster development
- **Option B (Better macOS UX)**: Swift (macOS native) + shared Go backend - Native feel, smaller binary
- **Option C (Balanced)**: Tauri + TypeScript - Lighter than Electron, still cross-platform

**VPN Protocols**: WireGuard (primary), OpenVPN (compatibility)

**Architecture**: Separate privileged backend service + GUI application communicating via Unix socket/HTTP API

## Basic Feature Set for MVP

### Core Features

1. **Connection Management**
   - Connect/disconnect to VPN servers
   - Auto-reconnect on connection drop
   - Multiple profile support
   - Save connection credentials securely

2. **Server/Profile Management**
   - Import VPN configurations (.conf, .ovpn files)
   - Add servers manually
   - Profile switching

3. **UI Components**
   - System tray icon with connection status
   - Main window for profile management
   - Connection logs viewer
   - Minimal settings (auto-connect, launch at startup)

4. **Platform Integration**
   - Launch at system startup
   - macOS: Menu bar integration
   - Windows: System tray
   - Linux: System tray (depending on DE)

5. **Network Features**
   - DNS configuration
   - Split tunneling (route specific traffic through VPN)
   - Kill switch (block traffic if VPN drops)
   - IP leak protection

### Nice-to-Have (Post-MVP)
- Multiple concurrent connections
- Server speed testing
- Geo-sorted server selection
- Traffic statistics
- Custom DNS servers

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         GUI Layer (Electron/Native)      │
│  - User interactions                    │
│  - Status display                       │
│  - Profile management UI                │
└─────────────────┬───────────────────────┘
                  │ IPC/WebSocket
┌─────────────────▼───────────────────────┐
│      Background Service (Go/Rust)       │
│  - VPN connection management            │
│  - Protocol handling (WG/OpenVPN)       │
│  - System network configuration         │
│  - Credential storage                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        System Integration Layer          │
│  - TUN/TAP device management            │
│  - Routing table modifications          │
│  - DNS configuration                    │
│  - Firewall rules (kill switch)         │
└──────────────────────────────────────────┘
```

## macOS-Specific Requirements

### System Extensions (macOS 10.15+)
- Network Extension framework required for VPN functionality
- Must use `NEVPNManager` or `NEPacketTunnelProvider`
- Requires proper entitlements and code signing
- App must be notarized by Apple

### Sandboxing
- GUI app likely needs sandbox entitlements
- VPN functionality requires system extension running outside sandbox
- Proper IPC communication between sandboxed GUI and privileged extension

### Distribution
- **App Store**: Strict requirements, review process, but easier distribution
- **Standalone (.pkg)**: More flexibility, requires notarization, user must allow system extension
- Most VPN clients use standalone + notarization approach

### Permissions
- User must approve system extension in System Settings
- VPN configuration permission prompt on first use
- Full disk access might be needed for some features

## Licensing & Permission Considerations

### For macOS
1. **Apple Developer Account** ($99/year) - Required for:
   - Code signing
   - Notarization
   - System extension development
   - App distribution

2. **Entitlements Needed**:
   - `com.apple.developer.networking.networkextension`
   - `com.apple.security.app-sandbox` (if sandboxed)
   - System extension entitlements

### VPN Protocol Licenses
- **WireGuard**: GPLv2 (Linux kernel module), MIT/BSD (userspace implementations)
- **OpenVPN**: GPLv2 (can use with commercial apps if properly structured)
- **Important**: Using GPL code may require open-sourcing your code unless using as separate process

### Recommended Approach
- Use permissive licensed libraries where possible (MIT, BSD, Apache 2.0)
- For GPL components (OpenVPN), run as separate process/binary
- WireGuard userspace implementations (wireguard-go) often have permissive licenses

## Open-Source Reference Projects

1. **Tailscale** - https://github.com/tailscale/tailscale
   - Stack: Go, WireGuard, various GUI clients
   - License: BSD-3-Clause
   - Good for: Architecture patterns, cross-platform VPN backend

2. **Pritunl Client Electron** - https://github.com/pritunl/pritunl-client-electron
   - Stack: Go backend + Electron GUI, OpenVPN/WireGuard support
   - Good for: Electron + Go architecture, macOS system extension handling

3. **WireGuard-go** - https://github.com/WireGuard/wireguard-go
   - Stack: Pure Go WireGuard implementation
   - License: MIT
   - Good for: Cross-platform WireGuard implementation reference
