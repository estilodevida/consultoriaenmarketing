'use client'

import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Resultados', href: '#estadisticas' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contacto', href: '#contacto' },
]

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cm-theme')
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved)
        document.documentElement.setAttribute('data-theme', saved)
      }
    } catch {}
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try { localStorage.setItem('cm-theme', next) } catch {}
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  function toggleMenu() {
    setMenuOpen((prev) => !prev)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && menuOpen) closeMenu()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  return (
    <>
      <nav>
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <span className="cm">Consultoría</span><span className="en">enMarketing</span>
          </a>
          <div className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>
          <div className="nav-actions">
            <button className="theme-btn" onClick={toggleTheme} aria-label="Cambiar modo">
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              )}
            </button>
            <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menú">
              <svg className="ham-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              <svg className="x-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`} onClick={closeMenu} />

      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-panel-inner">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          ))}
          <div className="mob-cta">
            <a href="#contacto" onClick={closeMenu}>Solicitar consultoría</a>
          </div>
        </div>
      </div>
    </>
  )
}
