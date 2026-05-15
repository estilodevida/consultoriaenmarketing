export function Testimonios() {
  return (
    <section id="testimonios">
      <div className="w">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <div className="section-label" style={{ margin: '0 auto 16px' }}>Testimonios</div>
          <h2 className="section-title">Lo que dicen <span className="gradient-text">nuestros clientes</span></h2>
          <p className="section-sub" style={{ margin: '0 auto 48px' }}>La opinión de quienes ya confiaron en nosotros para transformar su presencia digital.</p>
        </div>
        <div className="testimonials-grid">
          <div className="t-card reveal reveal-delay-1">
            <div className="quote">Transformaron completamente nuestra estrategia digital. Pasamos de no tener presencia online a multiplicar nuestros clientes por 3 en seis meses.</div>
            <div className="author">
              <div className="avatar">MR</div>
              <div><div className="name">María Rodríguez</div><div className="role">CEO — TechSolutions</div></div>
            </div>
          </div>
          <div className="t-card reveal reveal-delay-2">
            <div className="quote">La automatización con IA que implementaron nos ahorra 20 horas semanales en gestión de redes y atención al cliente. Increíble retorno de inversión.</div>
            <div className="author">
              <div className="avatar">CG</div>
              <div><div className="name">Carlos García</div><div className="role">Fundador — InnovaShop</div></div>
            </div>
          </div>
          <div className="t-card reveal reveal-delay-3">
            <div className="quote">Su enfoque en SEO nos llevó a la primera página de Google en menos de 3 meses. El desarrollo web con Next.js hizo que nuestras conversiones se dispararan.</div>
            <div className="author">
              <div className="avatar">AL</div>
              <div><div className="name">Ana López</div><div className="role">Directora Marketing — BuildCorp</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
