import React from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import Filters from '../components/Filters';
import { useProperties } from '../hooks/useProperties';

const Home = () => {
  const { 
    properties, 
    loading, 
    error, 
    pagination, 
    nextPage, 
    prevPage, 
    page, 
    handleSearch, 
    search, 
    filters, 
    handleFilterChange, 
    clearFilters
  } = useProperties();

  return (
    <main>
      <Hero onSearch={handleSearch} searchValue={search} />
      
      <section className="section container">
        <h2 className="section-title">Propiedades Destacadas</h2>
        
        <Filters filters={filters} onFilterChange={handleFilterChange} onClear={clearFilters} />
        
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando propiedades...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard key={property.public_id || Math.random()} property={property} />
              ))}
            </div>
            
            <div className="pagination-controls">
              <button 
                onClick={prevPage} 
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Anterior
              </button>
              <span className="page-info">Página {page}</span>
              <button 
                onClick={nextPage} 
                disabled={!pagination.next_page}
                className="btn btn-primary"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>

      <section className="section" style={{ backgroundColor: 'var(--color-background-alt)' }}>
        <div className="container">
          <h2 className="section-title">¿Por qué elegirnos?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>Experiencia</h3>
              <p>Más de 10 años conectando personas con su hogar ideal.</p>
            </div>
            <div className="feature-item">
              <h3>Confianza</h3>
              <p>Procesos transparentes y seguros en cada transacción.</p>
            </div>
            <div className="feature-item">
              <h3>Soporte</h3>
              <p>Acompañamiento personalizado en todo el proceso.</p>
            </div>
          </div>
        </div>
      </section>
      <style>{`
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--spacing-xl);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--spacing-xl);
          text-align: center;
        }
        .feature-item h3 {
          color: var(--color-secondary);
          margin-bottom: var(--spacing-sm);
          font-size: var(--font-size-xl);
        }
        .loading-container, .error-container {
          text-align: center;
          padding: var(--spacing-2xl);
          font-size: var(--font-size-lg);
          color: var(--color-text-light);
        }
        .error-container {
          color: #d32f2f;
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
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-2xl);
        }
        .page-info {
          font-weight: 600;
          color: var(--color-text-light);
        }
      `}</style>
    </main>
  );
};

export default Home;
