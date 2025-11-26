# Network Configuration

Network-level features including DNS, routing, split tunneling, and kill switch.

## Features

- Custom DNS configuration
- Split tunneling (selective routing)
- Kill switch (traffic blocking on VPN drop)
- IP leak protection
- IPv6 support and leak prevention
- Port forwarding configuration

## DNS Configuration

### DNS Handling
1. **System DNS Override** - Replace system DNS with VPN DNS
2. **Custom DNS Servers** - User-specified DNS servers (1.1.1.1, 8.8.8.8, etc.)
3. **DNS Leak Prevention** - Ensure all DNS queries go through VPN tunnel

### Implementation
- Modify system DNS settings when connected
- Restore original DNS on disconnect
- Monitor for DNS leaks

## Split Tunneling

Route specific applications or IP ranges outside the VPN tunnel while maintaining VPN for everything else.

### Use Cases
- Access local network devices while on VPN
- Route streaming services outside VPN for better performance
- Exclude specific applications from VPN tunnel

### Configuration
```json
{
  "splitTunnel": {
    "enabled": true,
    "excludedApps": [
      "/Applications/Safari.app",
      "/Applications/Music.app"
    ],
    "excludedIPs": [
      "192.168.1.0/24",
      "10.0.0.0/8"
    ],
    "includedIPs": [
      "0.0.0.0/0"
    ]
  }
}
```

## Kill Switch

Automatically block all internet traffic if VPN connection drops to prevent IP leaks.

### Implementation Methods

**macOS**: Network Extension API + Packet Filter (pf)
**Windows**: Windows Filtering Platform (WFP)
**Linux**: iptables/nftables rules

### Kill Switch Modes
1. **Automatic** - Enable when VPN connects, disable when intentionally disconnected
2. **Always On** - Block all non-VPN traffic permanently until disabled
3. **Disabled** - No traffic blocking

## IP Leak Protection

### Protection Layers
1. **IPv6 Leak Prevention** - Disable IPv6 or route through VPN
2. **WebRTC Leak Prevention** - Configure browser settings
3. **DNS Leak Prevention** - Force DNS through VPN
4. **Network Change Detection** - Re-establish VPN on network changes

## Implementation Details

### Go Backend Service
- `network/dns.go` - DNS configuration management
- `network/routing.go` - Routing table manipulation
- `network/killswitch.go` - Kill switch implementation
- `network/split-tunnel.go` - Split tunneling logic
- `network/leak-protection.go` - IP leak prevention

### Platform-Specific Code
- `network/darwin/` - macOS Network Extension APIs
- `network/windows/` - Windows WFP implementation
- `network/linux/` - iptables/netlink implementation

## Testing Considerations

- DNS leak tests (dnsleaktest.com)
- IP leak tests (ipleak.net)
- Kill switch activation testing
- Split tunnel routing verification
- IPv6 leak testing

## Related Documentation

- [Connection](../connection/) - Network setup during connection
- [Platform Integration](../platform-integration/) - OS-specific networking
- [Architecture](../architecture/) - System integration layer
