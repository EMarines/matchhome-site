import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getProperty } from '../services/api';

import { mockProperties } from '../data/mockProperties';
import inventoryData from '../data/inventory.json';

const PropertyDetails = () => {
  const { id } = useParams();
  const locationRoute = useLocation();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        
        // 1. Try to find in static inventory first (fastest)
        const staticProperty = inventoryData.find(p => p.public_id === id);
        if (staticProperty) {
          setProperty(staticProperty);
          setLoading(false);
          return;
        }

        // 2. Try to fetch from API
        const data = await getProperty(id);
        setProperty(data);
      } catch (err) {
        console.warn('API Error, trying to find in mock data:', err);
        // 3. Fallback to mock data
        const mock = mockProperties.find(p => p.public_id === id);
        if (mock) {
          setProperty(mock);
        } else {
          setError('Propiedad no encontrada');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) return (
    <div className="container loading-container">
      <div className="spinner"></div>
      <p>Cargando detalles...</p>
    </div>
  );

  if (error || !property) return (
    <div className="container error-container">
      <h2>Error</h2>
      <p>{error || 'No se pudo cargar la información de la propiedad.'}</p>
      <Link to="/" className="btn btn-primary">Volver al Inicio</Link>
    </div>
  );

  // Map fields
  const image = property.title_image_full || property.title_image_thumb || (property.property_images && property.property_images.length > 0 ? property.property_images[0].url : null) || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20600%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22270%22%20y%3D%22318%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  const title = property.title || 'Propiedad sin título';
  const description = property.description || 'Sin descripción disponible.';
  const location = typeof property.location === 'object' ? property.location.name : property.location || 'Ubicación no disponible';
  
  const price = property.operations && property.operations.length > 0 
    ? (property.operations[0].formatted_amount || property.operations[0].formated_amount || `${property.operations[0].amount} ${property.operations[0].currency}`)
    : 'Precio a consultar';

  const getOperationType = (type) => {
    const types = {
      sale: 'Venta',
      rental: 'Renta',
      temporary_rental: 'Renta Temporal'
    };
    return types[type] || type || 'Venta/Renta';
  };

  const type = property.operations && property.operations.length > 0 
    ? getOperationType(property.operations[0].type)
    : 'Venta/Renta';
  
  const beds = property.bedrooms || 0;
  const baths = property.bathrooms || 0;
  const area = property.construction_size || property.lot_size || 0;
  const features = property.features || [];

  return (
    <div className="property-details-page">
      <div className="container">
        <Link to="/" className="back-link">← Volver a Propiedades</Link>
        
        <div className="details-header">
          <h1 className="details-title">{title}</h1>
          <p className="details-location">{location}</p>
        </div>

        <div className="details-grid">
          <div className="details-main">
            <div className="image-gallery">
              <img src={image} alt={title} className="main-image" />
              {property.property_images && property.property_images.length > 0 && (
                <div className="gallery-grid">
                  {property.property_images.slice(0, 4).map((img, index) => (
                    <img key={index} src={img.url} alt={img.title || title} className="gallery-image" />
                  ))}
                </div>
              )}
            </div>

            <div className="details-info-bar">
              <div className="info-item">
                <span className="label">Precio</span>
                <span className="value price">{price}</span>
              </div>
              <div className="info-item">
                <span className="label">Operación</span>
                <span className="value">{type}</span>
              </div>
              <div className="info-item">
                <span className="label">Recámaras</span>
                <span className="value">{beds}</span>
              </div>
              <div className="info-item">
                <span className="label">Baños</span>
                <span className="value">{baths}</span>
              </div>
              {area > 0 && (
                <div className="info-item">
                  <span className="label">Área</span>
                  <span className="value">{area} m²</span>
                </div>
              )}
            </div>

            <div className="details-section">
              <h2>Descripción</h2>
              <div className="description-text">
                {description}
              </div>
            </div>

            {features.length > 0 && (
              <div className="details-section">
                <h2>Características</h2>
                <ul className="features-list">
                  {features.map((feature, index) => (
                    <li key={index} className="feature-tag">{feature.name || feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="details-sidebar">
            <div className="contact-card">
              <h3>¿Te interesa esta propiedad?</h3>
              <p>Contáctanos para agendar una visita.</p>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Nombre" className="form-input" />
                <input type="email" placeholder="Correo electrónico" className="form-input" />
                <input type="tel" placeholder="Teléfono" className="form-input" />
                <textarea placeholder="Mensaje" className="form-input" rows="4"></textarea>
                <button className="btn btn-primary full-width">Enviar Mensaje</button>
              </form>
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <Link 
                  to={locationRoute.state?.backUrl || '/'} 
                  className="btn btn-outline full-width"
                >
                  {locationRoute.state?.fromProposal ? 'Volver a mis opciones' : 'Regresar al Listado'}
                </Link>
              </div>
          </aside>
        </div>
      </div>

      <style>{`
        .property-details-page {
          padding: var(--spacing-xl) 0;
          background-color: var(--color-background-alt);
          min-height: 80vh;
        }
        .back-link {
          display: inline-block;
          margin-bottom: var(--spacing-md);
          color: var(--color-primary);
          font-weight: 500;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .details-header {
          margin-bottom: var(--spacing-lg);
        }
        .details-title {
          font-size: 2rem;
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }
        .details-location {
          color: var(--color-text-light);
          font-size: 1.1rem;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--spacing-2xl);
        }
        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
        .main-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }
        .gallery-image {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .gallery-image:hover {
          opacity: 0.8;
        }
        .details-info-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: var(--spacing-md);
          background: var(--color-white);
          padding: var(--spacing-lg);
          border-radius: 8px;
          margin: var(--spacing-lg) 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .info-item .label {
          font-size: 0.85rem;
          color: var(--color-text-light);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .info-item .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        .info-item .value.price {
          color: var(--color-secondary);
          font-size: 1.2rem;
        }
        .details-section {
          background: var(--color-white);
          padding: var(--spacing-lg);
          border-radius: 8px;
          margin-bottom: var(--spacing-lg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .details-section h2 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-md);
          font-size: 1.5rem;
          border-bottom: 2px solid var(--color-background-alt);
          padding-bottom: var(--spacing-xs);
        }
        .description-text {
          line-height: 1.8;
          color: var(--color-text-main);
        }
        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          list-style: none;
          padding: 0;
        }
        .feature-tag {
          background: var(--color-background-alt);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: var(--color-text-main);
        }
        .contact-card {
          background: var(--color-white);
          padding: var(--spacing-xl);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: sticky;
          top: 100px;
        }
        .contact-card h3 {
          color: var(--color-primary);
          margin-bottom: var(--spacing-xs);
        }
        .contact-card p {
          color: var(--color-text-light);
          margin-bottom: var(--spacing-lg);
        }
        .form-input {
          width: 100%;
          padding: 0.8rem;
          margin-bottom: var(--spacing-md);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          font-family: inherit;
        }
        .full-width {
          width: 100%;
        }
        .loading-container, .error-container {
          text-align: center;
          padding: 4rem 0;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border-left-color: var(--color-primary);
          animation: spin 1s linear infinite;
          margin: 0 auto var(--spacing-md);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 0.8rem;
          border-radius: 4px;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: var(--color-primary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default PropertyDetails;
