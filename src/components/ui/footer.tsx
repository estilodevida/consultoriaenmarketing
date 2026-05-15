'use client'

import { useEffect, useRef, useState } from 'react'
import { FooterCanvas } from './footer-canvas'

export function Footer() {
  const watermarkRef = useRef<SVGSVGElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    function fitWatermark() {
      const svg = watermarkRef.current
      const text = textRef.current
      if (!svg || !text) return
      try {
        const bbox = text.getBBox()
        if (bbox.width > 0 && bbox.height > 0) {
          svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
        }
      } catch {}
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitWatermark)
    } else {
      window.addEventListener('load', fitWatermark)
    }
    window.addEventListener('resize', fitWatermark)
    const timer = setTimeout(fitWatermark, 100)

    return () => {
      window.removeEventListener('resize', fitWatermark)
      clearTimeout(timer)
    }
  }, [])

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer>
      <div className="footer-wrapper">
        <div className="footer-left">
          <FooterCanvas />
          <div className="footer-logo">
            <div className="footer-logo-mark">CM</div>
            <span className="footer-logo-name">ConsultoríaenMarketing</span>
          </div>
          <div className="footer-tagline-container">
            <div className="footer-tagline">
              Transformamos tu presencia digital<br />
              <span>en resultados reales.</span>
            </div>
          </div>
          <div className="footer-social-row">
            <span className="footer-social-label">Síguenos</span>
            <div className="footer-social-icons">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 0 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-lucky-graphic">
            <div className="lucky-cube">
              <span className="lucky-cube-mark">CM</span>
            </div>
            <div className="lucky-text-row">
              <svg className="lucky-arrow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 20 C 6 14, 10 9, 18 5" />
                <path d="M18 5 L 12 5" />
                <path d="M18 5 L 18 11" />
              </svg>
              <span className="lucky-text">¿Hablamos?</span>
            </div>
          </div>

          <div className="footer-right-top">
            <div className="footer-nav-cols">
              <div className="footer-col">
                <div className="footer-col-title">Navegación</div>
                <a href="/">Inicio</a>
                <a href="#servicios">Servicios</a>
                <a href="#">Casos de éxito</a>
                <a href="#">Blog</a>
                <a href="#contacto">Contacto</a>
              </div>
              <div className="footer-col">
                <div className="footer-col-title">Empresa</div>
                <a href="#">Sobre nosotros</a>
                <a href="#">Aviso legal</a>
                <a href="#">Privacidad</a>
                <a href="#">Cookies</a>
                <a href="#">Términos del servicio</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">&copy; 2025 Consultoría en Marketing. Todos los derechos reservados.</div>
            <div className="footer-cta-mini">
              <h4>
                El marketing digital evoluciona.<br /><strong>Mantente al día con nosotros.</strong>
              </h4>
              {subscribed ? (
                <p style={{ fontSize: '.85rem', color: 'var(--secondary)' }}>¡Gracias por suscribirte!</p>
              ) : (
                <form className="footer-subscribe-row" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Tu correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">Suscribirse</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-watermark" aria-hidden="true">
        <svg ref={watermarkRef} id="watermarkSvg" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <text ref={textRef} id="watermarkText" x="600" y="165" textAnchor="middle" fontSize="180" fontFamily="Sora, sans-serif">
            Consultoría en Marketing
          </text>
        </svg>
      </div>
    </footer>
  )
}
