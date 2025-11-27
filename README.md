# VPN Client App

Cross-platform VPN client application with support for WireGuard and OpenVPN protocols, designed for ease of use on macOS with full Windows and Linux compatibility.

## Features

- 🔒 **Secure VPN Protocols**: WireGuard (modern & fast) and OpenVPN (industry standard)
- 🖥️ **Cross-Platform**: macOS, Windows, and Linux support
- 🎯 **Easy to Use**: Intuitive interface with menu bar/system tray integration
- 📁 **Profile Management**: Import `.conf` and `.ovpn` files or configure manually
- 🛡️ **Kill Switch**: Automatic traffic blocking if VPN disconnects
- 🌐 **Split Tunneling**: Route specific apps/IPs outside the VPN
- 🔄 **Auto-Reconnect**: Automatic reconnection on network changes
- 📊 **Connection Stats**: Real-time monitoring of connection status and data usage

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **VPN Protocols**: wireguard-go, OpenVPN
- **Architecture**: Privileged system service with HTTP/WebSocket API

### Frontend
- **Framework**: Electron + React + TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks

## Project Structure

```
vpn-client-app/
├── backend/              # Go backend service
│   ├── cmd/             # Entry points
│   ├── internal/        # Internal packages
│   │   ├── connection/  # Connection management
│   │   ├── profile/     # Profile CRUD
│   │   ├── network/     # Network configuration
│   │   └── api/         # API server
│   └── pkg/             # Public packages
│       ├── wireguard/   # WireGuard integration
│       └── openvpn/     # OpenVPN integration
├── gui/                 # Electron GUI application
│   ├── src/
│   │   ├── main/        # Electron main process
│   │   ├── renderer/    # React UI
│   │   └── shared/      # Shared types
│   └── assets/          # Icons, images
├── docs/                # Documentation
│   ├── architecture/    # System architecture
│   ├── connection/      # Connection management
│   ├── network/         # Network features
│   ├── platform-integration/  # OS-specific code
│   ├── profiles/        # Profile management
│   ├── ui/              # UI/UX design
│   ├── plan-vpnClientApp.md  # Master plan
│   └── github-workflow.md    # Git workflow
├── scripts/             # Build and utility scripts
├── .vscode/             # VS Code configuration
├── quality-manager.js   # Automated quality management (Lead Dev AI)
├── package.json         # Quality manager dependencies
├── IMPROVEMENTS.md      # Global TODO and improvement tracking
├── .gitignore
├── LICENSE
└── README.md
```

## Documentation

Comprehensive documentation is organized by feature area:

- **[Master Plan](docs/plan-vpnClientApp.md)** - Overall project plan and feature set
- **[Architecture](docs/architecture/)** - System design and component architecture
- **[Connection Management](docs/connection/)** - VPN connection lifecycle
- **[Profile Management](docs/profiles/)** - Profile configuration and storage
- **[Network Features](docs/network/)** - DNS, routing, kill switch, split tunneling
- **[UI Design](docs/ui/)** - User interface design and implementation
- **[Platform Integration](docs/platform-integration/)** - OS-specific integrations
- **[GitHub Workflow](docs/github-workflow.md)** - Git workflow and contribution guide

## Getting Started

### Prerequisites

- **macOS**: 11.0 or later, Xcode Command Line Tools
- **Windows**: Windows 10/11, Visual Studio Build Tools
- **Linux**: Ubuntu 20.04+ or equivalent
- **Go**: 1.21 or later
- **Node.js**: 20 or later
- **npm**: 9 or later

### Installation (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vpn-client-app.git
   cd vpn-client-app
   ```

2. **Build Backend**
   ```bash
   cd backend
   go mod download
   go build -o vpn-service ./cmd/vpn-service
   ```

3. **Build Frontend**
   ```bash
   cd gui
   npm install
   npm run dev
   ```

4. **Run the app**
   - Backend: `./backend/vpn-service`
   - Frontend: `npm run dev` in `gui/` directory

### VS Code Setup

Open the workspace file:
```bash
code vpn-client.code-workspace
```

Recommended extensions will be automatically suggested. Install them for the best development experience.

## Development

### Quality Management System

This project includes an automated quality management system that acts as a lead developer:

```bash
# Install dependencies for quality manager
npm install

# Start file watcher (monitors changes and provides code reviews)
npm run watch

# Perform full project scan
npm run scan
```

The quality manager:
- Monitors code changes in real-time
- Provides automated code reviews using LLM
- Maintains a global improvement TODO list in `IMPROVEMENTS.md`
- Suggests architectural improvements
- Identifies potential bugs and security issues

Configure via environment variables:
- `OLLAMA_HOST` - LLM API endpoint
- `OLLAMA_MODEL` - Model to use for analysis

### Running Tests

**Backend:**
```bash
cd backend
go test -v ./...
```

**Frontend:**
```bash
cd gui
npm test
```

### Building for Production

**macOS:**
```bash
./scripts/build-macos.sh
```

**Windows:**
```bash
./scripts/build-windows.sh
```

**Linux:**
```bash
./scripts/build-linux.sh
```

## Contributing

We welcome contributions! Please see our [GitHub Workflow Guide](docs/github-workflow.md) for:

- Branch naming conventions
- Commit message format
- Pull request process
- Code review guidelines

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Create a Pull Request

## Roadmap

### v0.1.0 - MVP (12 weeks) - In Progress
- [x] Project setup and documentation
- [x] UI/UX design mockups (HTML/CSS preview)
- [x] Dashboard interface with connection status
- [x] Profile management interface
- [x] Settings panel interface
- [x] Logs viewer interface
- [x] Navigation system (dropdown menu)
- [x] Quick actions in header
- [x] Responsive layout design
- [x] Interactive prototypes with JavaScript
- [x] Backend API structure (REST + WebSocket)
- [x] Basic backend service setup (Go)
- [x] Connection manager foundation
- [x] Profile manager foundation
- [ ] WireGuard protocol integration
- [ ] Electron integration
- [ ] macOS system integration

### v0.2.0 - Beta (8 weeks)
- [ ] OpenVPN protocol support
- [ ] Kill switch implementation
- [ ] Split tunneling
- [ ] Backend-frontend API connection
- [ ] Real-time statistics and monitoring
- [ ] Windows and Linux support

### v1.0.0 - Release (4 weeks)
- [ ] Production-ready installers
- [ ] Complete documentation
- [ ] User guide and tutorials
- [ ] Performance optimization
- [ ] Security audit

## License

[Choose appropriate license - MIT, GPL, etc.]

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/vpn-client-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/vpn-client-app/discussions)
- **Email**: support@yourcompany.com

## Acknowledgments

- [WireGuard](https://www.wireguard.com/) for the modern VPN protocol
- [OpenVPN](https://openvpn.net/) for the industry-standard VPN solution
- [Tailscale](https://github.com/tailscale/tailscale) for architecture inspiration
- [Electron](https://www.electronjs.org/) for cross-platform desktop framework

## Security

If you discover a security vulnerability, please email security@yourcompany.com instead of using the issue tracker.

---

**Status**: 🚧 In Active Development  
**Version**: 0.1.0-alpha  
**Last Updated**: November 27, 2025

**Current Focus**: Backend API development and Electron integration

**Completed**:
- ✅ UI/UX design and interactive prototypes
- ✅ Backend service foundation (Go)
- ✅ Project architecture and documentation
- ✅ API structure (REST + WebSocket)

**In Progress**:
- 🔄 VPN protocol integration (WireGuard)
- 🔄 Electron GUI setup
- 🔄 Backend-frontend communication

Contributions are welcome! Please check the project plan and open issues before starting work.
