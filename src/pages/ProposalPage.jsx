import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import inventoryData from '../data/inventory.json';
import { mockProperties } from '../data/mockProperties';

const ProposalPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [anchorProperty, setAnchorProperty] = useState(null);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL Params
  const clientName = searchParams.get('cliente') || 'Cliente';
  const targetBudget = parseFloat(searchParams.get('presupuesto'));
  const targetZone = searchParams.get('zona');

  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      
      // 1. Find Anchor Property
      let mainProp = inventoryData.find(p => p.public_id === id);
      if (!mainProp) {
        mainProp = mockProperties.find(p => p.public_id === id);
      }

      if (mainProp) {
        setAnchorProperty(mainProp);

        // 2. Find Similar Properties
        // Criteria:
        // - Same Operation Type (Sale/Rent)
        // - Price Range: +/- 20% of budget (or anchor price)
        // - Exclude the anchor property itself
        
        const operationType = mainProp.operations && mainProp.operations.length > 0 
          ? mainProp.operations[0].type 
          : 'sale';
        
        const basePrice = targetBudget || (mainProp.operations && mainProp.operations.length > 0 ? mainProp.operations[0].amount : 0);
        const similars = inventoryData.filter(p => {
          // Exclude self
          if (p.public_id === mainProp.public_id) return false;

          // Match Operation (Strict)
          const pOpType = p.operations && p.operations.length > 0 ? p.operations[0].type : '';
          if (pOpType !== operationType) return false;

          // Match Property Type (Strict)
          if (p.property_type !== mainProp.property_type) return false;

          return true;
        });

        // Sort by price difference (closest to basePrice)
        similars.sort((a, b) => {
          const priceA = a.operations && a.operations.length > 0 ? a.operations[0].amount : 0;
          const priceB = b.operations && b.operations.length > 0 ? b.operations[0].amount : 0;
          return Math.abs(priceA - basePrice) - Math.abs(priceB - basePrice);
        });

        // Limit to 6 similar properties
        setSimilarProperties(similars.slice(0, 6));
      }

      setLoading(false);
    };

    loadData();
  }, [id, targetBudget, targetZone]);

  if (loading) return (
    <div className="proposal-page loading">
      <div className="spinner"></div>
    </div>
  );

  if (!anchorProperty) return (
    <div className="proposal-page error">
      <div className="container">
        <h1>Propiedad no encontrada</h1>
        <p>Lo sentimos, no pudimos encontrar la propiedad que buscas.</p>
        <Link to="/" className="btn btn-primary">Ir al Inicio</Link>
      </div>
    </div>
  );

  // Helper for Anchor Property Display
  const anchorImage = anchorProperty.title_image_full || anchorProperty.title_image_thumb || (anchorProperty.property_images && anchorProperty.property_images[0]?.url);
  const anchorPrice = anchorProperty.operations && anchorProperty.operations.length > 0 
    ? (anchorProperty.operations[0].formatted_amount || `${anchorProperty.operations[0].amount} ${anchorProperty.operations[0].currency}`)
    : 'Consultar Precio';

  return (
    <div className="proposal-page">
      {/* Header / Greeting */}
      <header className="proposal-header">
        <div className="container">
          <div className="greeting-content">
            <h1>Hola, <span className="highlight">{clientName}</span></h1>
            <p className="subtitle">Preparamos esta selección exclusiva basada en tu interés.</p>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Section 1: Anchor Property */}
        <section className="anchor-section">
          <div className="section-header">
            <h2>Tu Interés Principal</h2>
            <div className="divider"></div>
          </div>
          
          <div className="anchor-card">
            <div className="anchor-image-container">
              <img src={anchorImage} alt={anchorProperty.title} className="anchor-image" />
              <div className="anchor-price-tag">{anchorPrice}</div>
            </div>
            <div className="anchor-details">
              <h3>{anchorProperty.title}</h3>
              <p className="anchor-location">📍 {typeof anchorProperty.location === 'object' ? anchorProperty.location.name : anchorProperty.location}</p>
              
              <div className="anchor-features">
                <span>🛏 {anchorProperty.bedrooms} Recámaras</span>
                <span>🚿 {anchorProperty.bathrooms} Baños</span>
                <span>📐 {anchorProperty.construction_size || anchorProperty.lot_size} m²</span>
              </div>

              <p className="anchor-description">
                {anchorProperty.description ? anchorProperty.description.substring(0, 200) + '...' : 'Sin descripción.'}
              </p>

              <div className="anchor-actions">
                {/* Placeholder for future Chat/AI interaction */}
                <div className="ai-placeholder">
                  <div className="ai-icon">🤖</div>
                  <div className="ai-text">
                    <strong>Asistente Virtual (Próximamente)</strong>
                    <p>Aquí podrás chatear y agendar tu visita directamente.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="similar-section">
            <div className="section-header">
              <h2>Otras Oportunidades para Ti</h2>
              <p>Propiedades similares que podrían interesarte</p>
              <div className="divider"></div>
            </div>

            <div className="properties-grid">
              {similarProperties.map(property => (
                <PropertyCard key={property.public_id} property={property} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .proposal-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 4rem;
        }

        .proposal-header {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          color: white;
          padding: 4rem 0 6rem;
          margin-bottom: -3rem;
          text-align: center;
        }

        .greeting-content h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 300;
        }

        .greeting-content .highlight {
          font-weight: 700;
          color: #fff;
        }

        .subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .anchor-section {
          margin-bottom: 4rem;
        }

        .anchor-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 0;
        }

        @media (max-width: 768px) {
          .anchor-card {
            grid-template-columns: 1fr;
          }
        }

        .anchor-image-container {
          position: relative;
          height: 100%;
          min-height: 300px;
        }

        .anchor-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .anchor-price-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.2rem;
          backdrop-filter: blur(4px);
        }

        .anchor-details {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .anchor-details h3 {
          font-size: 1.8rem;
          color: var(--color-primary);
          margin-bottom: 0.5rem;
        }

        .anchor-location {
          color: #666;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .anchor-features {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          color: #555;
          font-weight: 500;
        }

        .anchor-description {
          color: #777;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .ai-placeholder {
          background: #f0f7ff;
          border: 2px dashed #cce5ff;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ai-icon {
          font-size: 2rem;
        }

        .ai-text strong {
          display: block;
          color: var(--color-primary);
          margin-bottom: 0.2rem;
        }

        .ai-text p {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2rem;
          color: var(--color-text-main);
          margin-bottom: 0.5rem;
        }

        .divider {
          width: 60px;
          height: 4px;
          background: var(--color-secondary);
          margin: 1rem auto;
          border-radius: 2px;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .loading, .error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50vh;
        }

        .spinner {
          border: 4px solid rgba(0,0,0,0.1);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border-left-color: var(--color-primary);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProposalPage;
