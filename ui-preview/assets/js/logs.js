// Logs functionality

const logContainer = document.getElementById('logContainer');
let autoScroll = true;

// Filter logs by level
function filterLogs(level) {
  const entries = document.querySelectorAll('.log-entry');
  
  entries.forEach(entry => {
    const logLevel = entry.querySelector('.log-level').textContent.toLowerCase();
    
    if (level === 'all' || logLevel === level) {
      entry.style.display = 'flex';
    } else {
      entry.style.display = 'none';
    }
  });
}

// Clear logs
function clearLogs() {
  if (confirm('Are you sure you want to clear all logs?')) {
    logContainer.innerHTML = '<div class="log-entry"><span class="log-time">' + 
      getCurrentTime() + '</span><span class="log-level info">INFO</span>' +
      '<span class="log-message">Logs cleared</span></div>';
  }
}

// Export logs
function exportLogs() {
  const logs = [];
  document.querySelectorAll('.log-entry').forEach(entry => {
    const time = entry.querySelector('.log-time').textContent;
    const level = entry.querySelector('.log-level').textContent;
    const message = entry.querySelector('.log-message').textContent;
    logs.push(`[${time}] ${level}: ${message}`);
  });
  
  const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vpn-logs-${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// Get current time in log format
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Add new log entry (for demo/simulation)
function addLogEntry(level, message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML = `
    <span class="log-time">${getCurrentTime()}</span>
    <span class="log-level ${level.toLowerCase()}">${level.toUpperCase()}</span>
    <span class="log-message">${message}</span>
  `;
  
  logContainer.appendChild(entry);
  
  // Auto-scroll if enabled
  if (autoScroll) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// Toggle auto-scroll
document.querySelectorAll('.toggle-switch .switch').forEach(toggle => {
  toggle.addEventListener('click', () => {
    autoScroll = toggle.classList.contains('active');
  });
});

// Simulate live logs (for demo)
setInterval(() => {
  const messages = [
    { level: 'info', text: 'Keepalive packet sent' },
    { level: 'info', text: 'Traffic stats updated' },
    { level: 'success', text: 'Connection health check passed' }
  ];
  
  const random = messages[Math.floor(Math.random() * messages.length)];
  // Uncomment to see live logs simulation:
  // addLogEntry(random.level, random.text);
}, 5000);
