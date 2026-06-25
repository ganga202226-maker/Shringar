@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');

@import "tailwindcss";

/* @import statements must precede all other CSS — Google Fonts is first */

@theme {
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Playfair Display", serif;

  /* Brand Rose (Primary) */
  --color-rose-50: #FDF0F4;
  --color-rose-100: #F4C0D1;
  --color-rose-200: #ED93B1;
  --color-rose-400: #D4537E;
  --color-rose-600: #993556;
  --color-rose-800: #72243E;
  --color-rose-900: #4B1528;

  /* Warm Gold (Accent) */
  --color-gold-50: #FDF5E6;
  --color-gold-100: #FAC775;
  --color-gold-200: #EF9F27;
  --color-gold-400: #BA7517;
  --color-gold-800: #633806;

  /* Ivory Neutrals */
  --color-ivory-50: #FBF7F5;
  --color-ivory-100: #F2EDE9;
  --color-ivory-200: #E8DDD9;
  --color-ivory-400: #D3C5BE;
  --color-ivory-600: #888780;
  --color-ivory-900: #2C2C2A;

  /* Semantic */
  --color-bg: #FBF7F5;
  --color-surface: #FFFFFF;
  --color-primary: #D4537E;
  --color-primary-dark: #72243E;
  --color-gold: #EF9F27;
  --color-success: #1D9E75;
  --color-border: #E8DDD9;
  --color-text: #2C2C2A;
  --color-muted: #888780;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  /* Shadows */
  --shadow-card: 0 1px 3px rgba(180,120,120,0.08), 0 4px 16px rgba(180,120,120,0.06);
  --shadow-dropdown: 0 4px 12px rgba(180,120,120,0.12);

  /* Spacing */
  --spacing: 0.25rem;
}

/* ========== BASE STYLES ========== */

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

h1 { font-size: 2.25rem; font-weight: 600; color: var(--color-rose-800); }
h2 { font-size: 1.75rem; font-weight: 600; color: var(--color-ivory-900); }
h3 { font-size: 1.25rem; font-weight: 600; color: var(--color-ivory-900); }

.body-text { font-size: 1rem; font-weight: 400; color: var(--color-ivory-900); }
.muted-text { font-size: 0.875rem; font-weight: 400; color: var(--color-ivory-600); }
.caption-text { font-size: 0.75rem; font-weight: 400; color: var(--color-ivory-600); }

/* ========== COMPONENT UTILITIES ========== */

.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.btn-primary {
  background-color: var(--color-rose-400);
  color: #fff;
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-primary:hover {
  background-color: var(--color-rose-600);
}

.btn-secondary {
  background-color: transparent;
  border: 1.5px solid var(--color-rose-400);
  color: var(--color-rose-400);
  border-radius: var(--radius-full);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}
.btn-secondary:hover {
  background-color: var(--color-rose-50);
}

.input-field {
  border: 1px solid var(--color-ivory-400);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.input-field:focus {
  border-color: var(--color-rose-400);
}

/* Badges */
.badge-gold {
  background-color: var(--color-gold-50);
  color: var(--color-gold-800);
  border: 1px solid var(--color-gold-100);
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-rose {
  background-color: var(--color-rose-50);
  color: var(--color-rose-800);
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-success {
  background-color: #E1F5EE;
  color: #0F6E56;
  border-radius: var(--radius-full);
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Star ratings */
.star-filled { color: var(--color-gold-200); }
.star-empty { color: var(--color-ivory-400); }

/* Nav active */
.nav-active {
  color: var(--color-rose-400);
  border-bottom: 2px solid var(--color-rose-400);
}

/* Skeleton shimmer animation */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.shimmer {
  background: linear-gradient(90deg, var(--color-ivory-100) 25%, var(--color-ivory-50) 50%, var(--color-ivory-100) 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--color-ivory-50);
}
::-webkit-scrollbar-thumb {
  background: var(--color-ivory-400);
  border-radius: 3px;
}

/* Hide scrollbar for carousels */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
