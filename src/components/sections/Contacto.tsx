'use client'

export function Contacto() {
  return (
    <section id="contacto" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
      <div className="w">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ margin: '0 auto 16px' }}>Contacto</div>
          <h2 className="section-title">Empieza hoy tu <span className="gradient-text">transformación digital</span></h2>
          <p className="section-sub" style={{ margin: '0 auto 48px' }}>Cuéntanos tu proyecto y te propondremos una estrategia personalizada sin compromiso.</p>
        </div>
        <div className="contact-grid">
          <div className="contact-info reveal">
            <h3>Hablemos de tu proyecto</h3>
            <p>Estamos listos para ayudarte a escalar tu negocio. Rellena el formulario o escríbenos directamente y te responderemos en menos de 24 horas.</p>
            <div className="contact-methods">
              <div className="contact-method">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>hola@consultoriaenmarketing.com</span>
              </div>
              <div className="contact-method">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Sevilla, España</span>
              </div>
              <div className="contact-method">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Respuesta en menos de 24h</span>
              </div>
            </div>
          </div>
          <form className="contact-form reveal reveal-delay-2" id="contactForm" onSubmit={(e) => { e.preventDefault(); alert('Gracias por contactarnos. Te responderemos en menos de 24 horas.'); }}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre completo</label>
                <input type="text" id="name" name="name" required placeholder="Tu nombre" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input type="email" id="email" name="email" required placeholder="tu@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="service">Servicio de interés</label>
              <input type="text" id="service" name="service" placeholder="Marketing Digital, SEO, Desarrollo Web..." />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" required placeholder="Cuéntanos tu proyecto..." />
            </div>
            <button type="submit" className="submit-btn">
              Enviar mensaje
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polyline points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
