// Dashboard functionality
let isConnected = false;
let connectionStartTime = null;
let statsInterval = null;

const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const locationText = document.getElementById('locationText');
const connectBtn = document.getElementById('connectBtn');

// Simulate connection toggle
connectBtn.addEventListener('click', () => {
  if (!isConnected) {
    connect();
  } else {
    disconnect();
  }
});

function connect() {
  // Update UI to connecting state
  statusIndicator.className = 'status-indicator connecting';
  statusText.textContent = 'Connecting...';
  connectBtn.disabled = true;
  connectBtn.textContent = 'Connecting...';

  // Simulate connection delay
  setTimeout(() => {
    isConnected = true;
    connectionStartTime = Date.now();
    
    // Update UI to connected state
    statusIndicator.className = 'status-indicator connected';
    statusIndicator.innerHTML = '<span class="status-icon">✓</span>';
    statusText.textContent = 'Connected';
    locationText.textContent = 'Home Server (WireGuard) • 192.168.1.100';
    connectBtn.disabled = false;
    connectBtn.textContent = 'Disconnect';
    connectBtn.classList.add('disconnect');

    // Start updating stats
    startStatsUpdate();
  }, 2000);
}

function disconnect() {
  isConnected = false;
  connectionStartTime = null;
  
  // Update UI to disconnected state
  statusIndicator.className = 'status-indicator disconnected';
  statusIndicator.innerHTML = '<span class="status-icon">🔒</span>';
  statusText.textContent = 'Disconnected';
  locationText.textContent = 'No active connection';
  connectBtn.textContent = 'Connect';
  connectBtn.classList.remove('disconnect');

  // Stop updating stats
  stopStatsUpdate();
  resetStats();
}

function startStatsUpdate() {
  statsInterval = setInterval(() => {
    if (!isConnected) return;

    // Simulate random stats
    const upload = Math.floor(Math.random() * 500);
    const download = Math.floor(Math.random() * 1000);
    
    document.getElementById('uploadSpeed').textContent = upload;
    document.getElementById('downloadSpeed').textContent = download;

    // Update connection time
    if (connectionStartTime) {
      const elapsed = Math.floor((Date.now() - connectionStartTime) / 1000);
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      
      document.getElementById('connectionTime').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Update total data transferred
    const currentData = parseFloat(document.getElementById('dataTransferred').textContent) || 0;
    document.getElementById('dataTransferred').textContent = 
      (currentData + (upload + download) / 1024).toFixed(2);
  }, 1000);
}

function stopStatsUpdate() {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
}

function resetStats() {
  document.getElementById('uploadSpeed').textContent = '0';
  document.getElementById('downloadSpeed').textContent = '0';
  document.getElementById('connectionTime').textContent = '--:--:--';
  document.getElementById('dataTransferred').textContent = '0';
}
