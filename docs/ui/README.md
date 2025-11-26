# User Interface Design

Complete UI/UX design and implementation documentation for the VPN client application.

## Design Principles

1. **Simplicity First** - Minimize clicks to connect/disconnect
2. **Native Feel** - Match macOS design language (primary platform)
3. **Clear Status** - Always show connection state visually
4. **Quick Access** - System tray/menu bar for instant control
5. **Progressive Disclosure** - Advanced features hidden until needed

## Interface Components

### 1. Menu Bar / System Tray Icon

**macOS Menu Bar Icon**
- Shows connection status with icon color
  - Gray: Disconnected
  - Yellow/Orange: Connecting
  - Green: Connected
  - Red: Error
- Click to open dropdown menu with:
  - Current status (with server name if connected)
  - Quick connect/disconnect button
  - Recent profiles (max 5)
  - "Open VPN Client" menu item
  - Settings
  - Quit

**Windows System Tray**
- Similar functionality adapted to Windows conventions
- Right-click for full menu
- Left-click to toggle connection

### 2. Main Window

**Window Layout**
```
┌──────────────────────────────────────────┐
│  VPN Client                    ⚙️ ⓧ      │
├──────────────────────────────────────────┤
│                                          │
│    [●] Connection Status                 │
│     ● Disconnected                       │
│                                          │
│    ┌────────────────────────────────┐   │
│    │  Select Profile ▼              │   │
│    └────────────────────────────────┘   │
│                                          │
│    ┌────────────────────────────────┐   │
│    │      [  Connect  ]             │   │
│    └────────────────────────────────┘   │
│                                          │
│    Quick Stats:                          │
│    IP: Not connected                     │
│    Location: -                           │
│                                          │
├──────────────────────────────────────────┤
│  [Profiles] [Settings] [Logs]            │
└──────────────────────────────────────────┘
```

### 3. Profile Management View

```
┌──────────────────────────────────────────┐
│  Profiles                    [+ Add]      │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🌍 US East Server              ⋮   │ │
│  │    New York, NY • WireGuard        │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🌍 EU West Server              ⋮   │ │
│  │    Frankfurt, DE • OpenVPN         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🌍 Asia Pacific                ⋮   │ │
│  │    Singapore • WireGuard           │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

### 4. Settings Panel

```
┌──────────────────────────────────────────┐
│  Settings                                │
├──────────────────────────────────────────┤
│                                          │
│  General                                 │
│  ☑ Launch at startup                    │
│  ☑ Auto-connect on launch               │
│  ☐ Show notifications                   │
│                                          │
│  Connection                              │
│  ☑ Auto-reconnect on network change     │
│  ☑ Enable kill switch                   │
│  Kill switch mode: [Automatic ▼]        │
│                                          │
│  Network                                 │
│  DNS: [Automatic ▼]                     │
│  ☐ Enable split tunneling               │
│  ☐ Block IPv6 when connected            │
│                                          │
│  Advanced                                │
│  Protocol preference: [WireGuard ▼]     │
│  Connection timeout: [30s ▼]            │
│                                          │
└──────────────────────────────────────────┘
```

### 5. Connection Logs View

```
┌──────────────────────────────────────────┐
│  Connection Logs        [Clear] [Export] │
├──────────────────────────────────────────┤
│                                          │
│  15:23:45  Connected to US East Server   │
│  15:23:43  Establishing connection...    │
│  15:23:42  DNS configured: 1.1.1.1      │
│  15:23:41  Routing table updated         │
│  15:23:40  TUN device created            │
│  15:23:39  Connecting to 198.51.100.1   │
│                                          │
│  [Earlier logs...]                       │
│                                          │
└──────────────────────────────────────────┘
```

## User Flows

### Flow 1: First Launch
1. User opens app for first time
2. Welcome screen with "Get Started" button
3. Prompt to import config file or add server manually
4. Import/add first profile
5. Prompt for system permissions (Network Extension)
6. User approves in System Settings
7. Return to app → Profile selected → Click "Connect"
8. Success! Connected state shown

### Flow 2: Quick Connect (Returning User)
1. User clicks menu bar icon
2. Sees current status + recent profiles
3. Clicks profile name → Auto-connects
4. Icon changes to green → Connected

### Flow 3: Adding New Profile
1. Main window → Profiles tab
2. Click "+ Add" button
3. Choose method:
   - Import file (.conf/.ovpn)
   - Manual entry
4. If import: File picker → Select file → Parsed → Preview → Save
5. If manual: Form with fields → Fill → Save
6. New profile appears in list

### Flow 4: Connection Error Handling
1. User clicks "Connect"
2. Connection fails (timeout, auth error, etc.)
3. Error notification shown with specific message
4. Suggestion for fix (check credentials, server status, etc.)
5. Option to view logs or retry

## Visual Design Guidelines

### Colors
- **Primary**: Blue (#007AFF) - macOS accent color
- **Success**: Green (#34C759) - Connected state
- **Warning**: Orange (#FF9500) - Connecting state
- **Error**: Red (#FF3B30) - Error state
- **Neutral**: Gray (#8E8E93) - Disconnected state

### Typography
- **macOS**: SF Pro (system font)
- **Windows**: Segoe UI
- **Linux**: System default (Roboto fallback)

### Icons
- Use SF Symbols on macOS
- Material Design Icons for cross-platform consistency
- Consistent icon size: 16px (small), 24px (medium), 32px (large)

### Spacing
- Base unit: 8px
- Padding: 16px (standard), 24px (large)
- Border radius: 6px (buttons), 8px (cards)

## Accessibility

- Full keyboard navigation support
- VoiceOver/screen reader compatibility
- High contrast mode support
- Minimum touch target size: 44x44px
- Color-blind friendly status indicators (shape + color)

## Responsive Behavior

**Minimum Window Size**: 400x600px
**Default Window Size**: 480x720px
**Maximum Window Size**: 800x1000px

Window remembers last size and position.

## Implementation Details

### Electron App Structure
```
gui/
├── src/
│   ├── main/           # Main process (Node.js)
│   │   ├── index.ts    # App initialization
│   │   ├── ipc.ts      # IPC handlers
│   │   └── tray.ts     # Menu bar/system tray
│   ├── renderer/       # Renderer process (UI)
│   │   ├── App.tsx     # Main React component
│   │   ├── components/ # UI components
│   │   │   ├── ConnectionStatus.tsx
│   │   │   ├── ProfileList.tsx
│   │   │   ├── SettingsPanel.tsx
│   │   │   └── LogsViewer.tsx
│   │   ├── hooks/      # React hooks
│   │   └── styles/     # CSS/styling
│   └── shared/         # Shared types/utilities
├── assets/             # Icons, images
└── public/             # Static files
```

### State Management
Use React Context + Hooks for:
- Connection state
- Current profile
- Settings
- Logs

### IPC Communication
```typescript
// Renderer → Main
ipcRenderer.invoke('connect', profileId)
ipcRenderer.invoke('disconnect')
ipcRenderer.invoke('getProfiles')

// Main → Renderer
mainWindow.webContents.send('connection-status', status)
mainWindow.webContents.send('log-message', message)
```

## Related Documentation

- [Connection](../connection/) - Connection state management
- [Profiles](../profiles/) - Profile data structure
- [Platform Integration](../platform-integration/) - Native UI elements
