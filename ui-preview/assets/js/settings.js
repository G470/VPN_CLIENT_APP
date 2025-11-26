// Settings functionality

// Initialize settings from localStorage or defaults
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('vpnSettings') || '{}');
  
  // Apply saved settings to UI
  document.querySelectorAll('.switch').forEach(toggle => {
    const settingName = toggle.previousElementSibling?.textContent?.trim();
    if (settings[settingName]) {
      toggle.classList.add('active');
    }
  });
}

// Save settings
document.querySelector('.btn-primary')?.addEventListener('click', () => {
  const settings = {};
  
  // Collect all toggle states
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    const label = toggle.querySelector('span').textContent.trim();
    const isActive = toggle.querySelector('.switch').classList.contains('active');
    settings[label] = isActive;
  });
  
  // Collect form values
  document.querySelectorAll('.form-control').forEach(input => {
    const label = input.previousElementSibling?.textContent?.trim();
    if (label) {
      settings[label] = input.value;
    }
  });
  
  // Save to localStorage
  localStorage.setItem('vpnSettings', JSON.stringify(settings));
  
  // Show success message
  alert('Settings saved successfully!');
});

// Reset to defaults
document.querySelector('.btn-secondary')?.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    localStorage.removeItem('vpnSettings');
    location.reload();
  }
});

// Load settings on page load
loadSettings();
