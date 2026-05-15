import { HeroCanvas } from "@/components/ui/hero-canvas"

export function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <HeroCanvas />
      </div>
      <div className="w">
        <div className="hero-grid">
          <div>
            <div className="hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Consultoría 360° con IA
            </div>
            <h1>
              Transformamos tu presencia digital<br />
              <span className="gradient-text">en resultados reales</span>
            </h1>
            <p>
              Estrategia, automatización con inteligencia artificial, desarrollo web moderno y consultoría estratégica para empresas, emprendedores y autónomos que quieren escalar en internet.
            </p>
            <div className="hero-actions">
              <a href="#contacto" className="cta-btn cta-btn-accent" style={{ padding: '14px 28px', fontSize: '1rem', color: '#000a0a' }}>
                Solicitar consultoría
              </a>
              <a href="#servicios" className="cta-btn cta-btn-accent" style={{ padding: '14px 28px', fontSize: '1rem', color: '#000a0a' }}>
                Ver servicios
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-glass-card">
              <div className="stat-row">
                <div className="stat-item"><div className="stat-num">50+</div><div className="stat-lbl">Proyectos exitosos</div></div>
                <div className="stat-item"><div className="stat-num">95%</div><div className="stat-lbl">Retención clientes</div></div>
                <div className="stat-item"><div className="stat-num">3×</div><div className="stat-lbl">Crecimiento medio</div></div>
                <div className="stat-item"><div className="stat-num">12+</div><div className="stat-lbl">Sectores cubiertos</div></div>
              </div>
              <div className="stat-div" />
              <div className="service-tags">
                <span className="tag">Marketing Digital</span>
                <span className="tag">SEO & SEM</span>
                <span className="tag">Desarrollo Web</span>
                <span className="tag">Automatización IA</span>
                <span className="tag">Agentes IA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
