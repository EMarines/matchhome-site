import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-column">
          <h3 className="footer-logo">MatchHome</h3>
          <p className="footer-desc">
            Tu aliado confiable para encontrar la propiedad de tus sueños.
            Experiencia, seguridad y confianza.
          </p>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">Enlaces Rápidos</h4>
          <ul className="footer-links">
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Propiedades</a></li>
            <li><a href="#">Nosotros</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
        <div className="footer-column">
          <h4 className="footer-title">Contacto</h4>
          <ul className="footer-contact">
            <li>📍 Av. Principal 123, Ciudad</li>
            <li>📞 +52 55 1234 5678</li>
            <li>✉️ contacto@matchhome.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 MatchHome. Todos los derechos reservados.</p>
        <div style={{ marginTop: '10px' }}>
          <UpdateInventoryButton />
        </div>
      </div>
      <style>{`
        .footer {
          background-color: var(--color-text-main);
          color: var(--color-white);
          padding-top: var(--spacing-2xl);
        }
        .footer-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-xl);
          padding-bottom: var(--spacing-2xl);
        }
        .footer-logo {
          font-size: var(--font-size-2xl);
          color: var(--color-white);
          margin-bottom: var(--spacing-md);
        }
        .footer-desc {
          color: #ccc;
          line-height: 1.6;
        }
        .footer-title {
          font-size: var(--font-size-lg);
          margin-bottom: var(--spacing-md);
          color: var(--color-secondary);
        }
        .footer-links li, .footer-contact li {
          margin-bottom: var(--spacing-sm);
        }
        .footer-links a {
          color: #ccc;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--color-secondary);
        }
        .footer-bottom {
          background-color: #000;
          padding: var(--spacing-md);
          text-align: center;
          color: #888;
          font-size: var(--font-size-sm);
        }

        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: var(--spacing-lg);
          }
        }
      `}</style>
    </footer>
  );
};

const UpdateInventoryButton = () => {
  const [updating, setUpdating] = React.useState(false);

  const handleUpdate = async () => {
    if (!confirm('¿Estás seguro de actualizar el inventario? Esto tomará unos minutos.')) return;
    
    setUpdating(true);
    try {
      const res = await fetch('/update-inventory', { method: 'POST' });
      if (res.ok) {
        alert('¡Inventario actualizado con éxito! La página se recargará.');
        window.location.reload();
      } else {
        alert('Error al actualizar el inventario.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión.');
    } finally {
      setUpdating(false);
    }
  };

  // Only show in development (localhost) - Commented out for visibility testing
  // if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return null;

  return (
    <button 
      onClick={handleUpdate} 
      disabled={updating}
      style={{
        background: '#fff',
        border: '1px solid #fff',
        color: '#000',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '15px',
        display: 'inline-block'
      }}
    >
      {updating ? '⏳ Actualizando...' : '🔄 Actualizar Inventario (Dev)'}
    </button>
  );
};

export default Footer;
