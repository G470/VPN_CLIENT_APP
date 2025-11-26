# Connection Management

VPN connection lifecycle management including connect/disconnect operations, auto-reconnect, and connection monitoring.

## Features

- Connect/disconnect to VPN servers
- Auto-reconnect on connection drop with exponential backoff
- Connection state monitoring and health checks
- Connection timeout handling
- Multiple profile support with quick switching
- Connection statistics (uptime, data transferred)

## Architecture

The connection manager sits between the GUI layer and the VPN protocol implementations (WireGuard/OpenVPN). It provides a unified interface for:

1. **Connection State Machine**
   - Disconnected → Connecting → Connected → Disconnecting → Disconnected
   - Error states and recovery

2. **Auto-Reconnect Logic**
   - Network change detection
   - Exponential backoff (1s, 2s, 4s, 8s, max 30s)
   - Maximum retry attempts (configurable)

3. **Health Monitoring**
   - Ping remote endpoint every 30s
   - Bandwidth monitoring
   - Latency tracking

## Implementation Details

### Go Backend Service
- `connection/manager.go` - Main connection orchestrator
- `connection/state.go` - State machine implementation
- `connection/health.go` - Health check and monitoring
- `connection/reconnect.go` - Auto-reconnect logic

### API Endpoints
- `POST /api/connect` - Initiate connection
- `POST /api/disconnect` - Terminate connection
- `GET /api/status` - Current connection status
- `GET /api/stats` - Connection statistics

## Testing Considerations

- Network interruption simulation
- Protocol-specific connection tests
- Stress testing with rapid connect/disconnect
- Long-running connection stability

## Related Documentation

- [Profiles](../profiles/) - Profile management and configuration
- [Network](../network/) - Network configuration and routing
- [UI](../ui/) - User interface for connection control
