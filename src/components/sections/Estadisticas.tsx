export function Estadisticas() {
  return (
    <section className="stats-section" id="estadisticas">
      <div className="w">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ margin: '0 auto 16px' }}>Resultados</div>
          <h2 className="section-title">Por qué <span className="gradient-text">elegirnos</span></h2>
          <p className="section-sub" style={{ margin: '0 auto 48px' }}>Números que avalan nuestro trabajo y la confianza de nuestros clientes.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card reveal reveal-delay-1"><div className="num">50+</div><div className="lbl">Proyectos completados</div></div>
          <div className="stat-card reveal reveal-delay-2"><div className="num">95%</div><div className="lbl">Satisfacción cliente</div></div>
          <div className="stat-card reveal reveal-delay-3"><div className="num">3×</div><div className="lbl">Crecimiento medio anual</div></div>
          <div className="stat-card reveal reveal-delay-4"><div className="num">12</div><div className="lbl">Sectores especializados</div></div>
        </div>
      </div>
    </section>
  )
}
