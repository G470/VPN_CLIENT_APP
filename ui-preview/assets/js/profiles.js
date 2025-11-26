// Profile management functionality

function selectProfile(element) {
  // Remove active class from all profiles
  document.querySelectorAll('.profile-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected profile
  element.classList.add('active');
}

function showAddProfile() {
  const form = document.getElementById('addProfileForm');
  form.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth' });
}

function hideAddProfile() {
  const form = document.getElementById('addProfileForm');
  form.classList.add('hidden');
}

// Event listeners for profile actions
document.querySelectorAll('.profile-actions button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent profile selection when clicking action buttons
  });
});
