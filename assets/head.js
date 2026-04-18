// Tailwind CDN config — must be set before the CDN script loads.
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:   ['Hind Siliguri','Inter','sans-serif'],
        latin:  ['Inter','sans-serif'],
        arabic: ['Scheherazade New','Amiri','serif'],
      },
      colors: {
        brand: {
          50:'#ECFDF4',100:'#D1FADF',200:'#A6F4C5',300:'#6CE9A6',
          400:'#32D583',500:'#12B76A',600:'#039855',700:'#027A48',
          800:'#05603A',900:'#054F31',950:'#052E1C',
        },
        gold: {
          300:'#FCD34D',400:'#FBBF24',500:'#F59E0B',600:'#D97706',700:'#B45309',
        },
      },
    },
  },
};

// Theme toggle (runs after DOM ready)
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.add('dark');
  }
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
