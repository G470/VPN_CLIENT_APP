# Platform Integration

OS-specific integrations for macOS, Windows, and Linux including system services, permissions, and native APIs.

## macOS Integration

### Network Extension Framework

Required for VPN functionality on macOS 10.15+.

**Key Components:**
- `NEVPNManager` - VPN configuration management
- `NEPacketTunnelProvider` - Packet tunnel implementation
- System Extension instead of kernel extension

**Implementation:**
```swift
// Network Extension target
import NetworkExtension

class PacketTunnelProvider: NEPacketTunnelProvider {
    override func startTunnel(options: [String : NSObject]?) async throws {
        // Initialize VPN connection
    }
    
    override func stopTunnel(with reason: NEProviderStopReason) async {
        // Cleanup VPN connection
    }
}
```

### Entitlements Required

**GUI App** (`VPN Client.app`)
```xml
<key>com.apple.security.app-sandbox</key>
<true/>
<key>com.apple.security.network.client</key>
<true/>
<key>com.apple.application-identifier</key>
<string>TEAMID.com.yourcompany.vpnclient</string>
```

**System Extension** (`VPN Client Extension.systemextension`)
```xml
<key>com.apple.developer.networking.networkextension</key>
<array>
    <string>packet-tunnel-provider</string>
</array>
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.yourcompany.vpnclient</string>
</array>
```

### Code Signing & Notarization

**Requirements:**
1. Apple Developer Account ($99/year)
2. Developer ID Application certificate
3. Developer ID Installer certificate (for .pkg)

**Build Process:**
```bash
# Sign the app
codesign --deep --force --options runtime \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  VPN\ Client.app

# Sign the system extension
codesign --force --options runtime \
  --sign "Developer ID Application: Your Name (TEAMID)" \
  VPN\ Client.app/Contents/Library/SystemExtensions/*.systemextension

# Create installer package
productbuild --sign "Developer ID Installer: Your Name (TEAMID)" \
  --component VPN\ Client.app /Applications \
  VPN-Client-Installer.pkg

# Notarize
xcrun notarytool submit VPN-Client-Installer.pkg \
  --apple-id your@email.com \
  --team-id TEAMID \
  --password app-specific-password \
  --wait

# Staple notarization ticket
xcrun stapler staple VPN-Client-Installer.pkg
```

### Launch Daemon

Background service running with elevated privileges.

**Location:** `/Library/LaunchDaemons/com.yourcompany.vpnclient.daemon.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.yourcompany.vpnclient.daemon</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/vpn-service</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

### Keychain Integration

Store credentials securely in macOS Keychain.

```go
// Example using keychain library
import "github.com/keybase/go-keychain"

func StorePassword(service, account, password string) error {
    item := keychain.NewItem()
    item.SetSecClass(keychain.SecClassGenericPassword)
    item.SetService(service)
    item.SetAccount(account)
    item.SetData([]byte(password))
    item.SetAccessible(keychain.AccessibleWhenUnlocked)
    
    return keychain.AddItem(item)
}
```

---

## Windows Integration

### Windows Service

Background service for VPN management.

**Installation:**
```powershell
sc.exe create VPNClientService binPath= "C:\Program Files\VPN Client\vpn-service.exe" start= auto
sc.exe start VPNClientService
```

**Service Implementation (Go):**
```go
import "golang.org/x/sys/windows/svc"

type vpnService struct{}

func (m *vpnService) Execute(args []string, r <-chan svc.ChangeRequest, 
  changes chan<- svc.Status) (bool, uint32) {
    changes <- svc.Status{State: svc.Running, Accepts: svc.AcceptStop}
    
    for {
        select {
        case c := <-r:
            switch c.Cmd {
            case svc.Stop, svc.Shutdown:
                return false, 0
            }
        }
    }
}
```

### WinTUN Driver

Modern userspace tunnel driver for Windows.

**Integration:**
```go
import "golang.zx2c4.com/wireguard/tun"

func CreateTunInterface() (tun.Device, error) {
    return tun.CreateTUN("VPN Client", 1420)
}
```

### Windows Filtering Platform (WFP)

Kill switch implementation using WFP.

```go
// Block all traffic except VPN
func EnableKillSwitch(vpnInterface string) error {
    // Create WFP filters to block non-VPN traffic
    // Implementation using Windows API
}
```

### Credential Manager

Store credentials in Windows Credential Manager.

```go
import "github.com/danieljoos/wincred"

func StoreCredential(target, username, password string) error {
    cred := wincred.NewGenericCredential(target)
    cred.UserName = username
    cred.CredentialBlob = []byte(password)
    return cred.Write()
}
```

---

## Linux Integration

### systemd Service

**Location:** `/etc/systemd/system/vpn-client.service`

```ini
[Unit]
Description=VPN Client Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/vpn-service
Restart=on-failure
User=root

[Install]
WantedBy=multi-user.target
```

**Enable:**
```bash
sudo systemctl enable vpn-client.service
sudo systemctl start vpn-client.service
```

### TUN/TAP Interface

Create TUN interface for VPN tunnel.

```go
import "golang.zx2c4.com/wireguard/tun"

func CreateTunInterface() (tun.Device, error) {
    return tun.CreateTUN("vpn0", 1420)
}
```

### iptables/nftables

Kill switch and routing implementation.

```bash
# Kill switch using iptables
iptables -A OUTPUT -o tun0 -j ACCEPT
iptables -A OUTPUT -d 192.168.0.0/16 -j ACCEPT
iptables -A OUTPUT -j DROP

# Restore on disconnect
iptables -F OUTPUT
```

### Secret Service (libsecret)

Credential storage for GNOME/KDE.

```go
import "github.com/zalando/go-keyring"

func StorePassword(service, user, password string) error {
    return keyring.Set(service, user, password)
}
```

---

## Cross-Platform Abstractions

Create platform-agnostic interfaces with OS-specific implementations.

```go
// credential/credential.go
type Store interface {
    Set(service, account, secret string) error
    Get(service, account string) (string, error)
    Delete(service, account string) error
}

// credential/darwin.go
// +build darwin
func NewStore() Store {
    return &keychainStore{}
}

// credential/windows.go
// +build windows
func NewStore() Store {
    return &credmanStore{}
}

// credential/linux.go
// +build linux
func NewStore() Store {
    return &secretServiceStore{}
}
```

## Testing Platform Integration

- Test on each OS version (macOS 11+, Windows 10/11, Ubuntu 20.04+)
- Verify system permissions prompt correctly
- Test service installation/uninstallation
- Verify credential storage and retrieval
- Test system tray/menu bar integration

## Related Documentation

- [Network](../network/) - Platform-specific networking implementations
- [Connection](../connection/) - OS integration during connection
- [Architecture](../architecture/) - Overall system design
