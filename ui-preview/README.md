# VPN Client UI Preview

Modern minimal interface design for the VPN Client application.

## Preview Instructions

Open any of these HTML files in your browser to preview the design:

- **index.html** - Main dashboard with connection status and stats
- **profiles.html** - VPN profile management
- **settings.html** - Application settings and configuration
- **logs.html** - System logs viewer

## Features

### Dashboard (index.html)
- Connection status indicator with animated states
- One-click connect/disconnect button
- Real-time statistics (upload/download speed, connection time, data transferred)
- Quick toggle switches for common settings

### Profiles (profiles.html)
- Visual profile cards with protocol indicators
- Add/edit/delete profile functionality
- Profile selection with active state highlighting
- Support for WireGuard and OpenVPN protocols

### Settings (settings.html)
- General preferences (startup, theme, notifications)
- Connection settings (auto-connect, reconnect, timeout)
- Security options (kill switch, DNS protection, IPv6 protection)
- Advanced configuration (debug logging, MTU, keepalive)

### Logs (logs.html)
- Real-time log viewer with syntax highlighting
- Filter by log level (info, warning, error, success)
- Auto-scroll toggle
- Export and clear log functionality

## Design System

- **Colors**: Modern indigo primary with semantic success/warning/danger colors
- **Typography**: System font stack for native feel
- **Layout**: Clean grid-based responsive design
- **Animations**: Smooth transitions and state changes
- **Icons**: Emoji-based for quick prototyping (replace with icon font/SVG later)

## Interactive Features

All pages include working JavaScript for:
- Toggle switches
- Connection state simulation (dashboard)
- Profile selection
- Settings persistence (localStorage)
- Log filtering and export

## Next Steps

1. Replace emoji icons with proper icon library (e.g., Heroicons, Feather Icons)
2. Implement dark mode theme
3. Add responsive breakpoints for mobile/tablet
4. Connect to backend API endpoints
5. Integrate into Electron app

## Browser Compatibility

Tested in modern browsers (Chrome, Firefox, Safari, Edge). Uses CSS Grid and modern JavaScript features.
