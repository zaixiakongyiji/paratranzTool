export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.color = '#fff';
  if (type === 'error') {
    toast.style.backgroundColor = 'var(--danger-color)';
  } else if (type === 'success') {
    toast.style.backgroundColor = 'var(--success-color)';
  } else {
    toast.style.backgroundColor = 'var(--accent-color)';
  }
  toast.style.zIndex = '9999';
  toast.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.style.opacity = '1', 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
