import React from 'react';

const Filters = ({ filters, onFilterChange, onClear }) => {
  const ZONES = ['Norte', 'Sur', 'Este', 'Oeste', 'CentroNorte', 'CentroSur'];
  const AMENITIES = [
    'Recamara en Planta Baja',
    'Una Planta',
    'Frente a Parque',
    'Nueva',
    'Sobre Avenida',
    'Alberca',
    'Lista para Habitarse',
    'Patio Amplio'
  ];

  const toggleTag = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    onFilterChange('tags', newTags);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="filters-container">
      <div className="filters-grid">
        <div className="filter-group">
          <label>Operación</label>
          <select name="operationType" value={filters.operationType} onChange={handleChange}>
            <option value="">Cualquiera</option>
            <option value="sale">Venta</option>
            <option value="rental">Renta</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tipo de Propiedad</label>
          <select name="propertyType" value={filters.propertyType} onChange={handleChange}>
            <option value="">Cualquiera</option>
            <optgroup label="Residencial">
              <option value="Casa">Casa</option>
              <option value="Casa en condominio">Casa en condominio</option>
              <option value="Departamento">Departamento</option>
              <option value="Quinta">Quinta</option>
              <option value="Rancho">Rancho</option>
              <option value="Terreno">Terreno</option>
              <option value="Villa">Villa</option>
            </optgroup>
            <optgroup label="Comercial">
              <option value="Bodega comercial">Bodega comercial</option>
              <option value="Casa con uso de suelo">Casa con uso de suelo</option>
              <option value="Edificio">Edificio</option>
              <option value="Huerta">Huerta</option>
              <option value="Local comercial">Local comercial</option>
              <option value="Local en centro comercial">Local en centro comercial</option>
            </optgroup>
          </select>
        </div>

        <div className="filter-group">
          <label>Recámaras</label>
          <select name="bedrooms" value={filters.bedrooms} onChange={handleChange}>
            <option value="0">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Baños</label>
          <select name="bathrooms" value={filters.bathrooms} onChange={handleChange}>
            <option value="0">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Estacionamientos</label>
          <select name="parking" value={filters.parking} onChange={handleChange}>
            <option value="0">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="filter-group price-group">
          <label>Precio</label>
          <div className="price-inputs">
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleChange}
              min="0"
            />
            <span>-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="tags-section">
        <label>Zonas</label>
        <div className="tags-grid">
          {ZONES.map(zone => (
            <button
              key={zone}
              className={`tag-chip ${filters.tags?.includes(zone) ? 'active' : ''}`}
              onClick={() => toggleTag(zone)}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      <div className="tags-section">
        <label>Amenidades</label>
        <div className="tags-grid">
          {AMENITIES.map(amenity => (
            <button
              key={amenity}
              className={`tag-chip ${filters.tags?.includes(amenity) ? 'active' : ''}`}
              onClick={() => toggleTag(amenity)}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-outline clear-btn" onClick={onClear}>
        Limpiar Filtros
      </button>

      <style>{`
        .filters-container {
          background: white;
          padding: var(--spacing-md);
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: var(--spacing-xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        .filters-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
          align-items: flex-end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        .filter-group label {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-light);
        }
        .filter-group select, .filter-group input {
          padding: var(--spacing-sm);
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: var(--font-size-base);
          min-width: 120px;
        }
        .price-group {
          flex: 1;
          min-width: 250px;
        }
        .price-inputs {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        .price-inputs input {
          width: 100%;
        }
        .tags-section {
          width: 100%;
        }
        .tags-section label {
          display: block;
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-light);
          margin-bottom: var(--spacing-xs);
        }
        .tags-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }
        .tag-chip {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          font-size: var(--font-size-sm);
          transition: all 0.2s;
        }
        .tag-chip:hover {
          background: #f5f5f5;
        }
        .tag-chip.active {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        @media (max-width: 768px) {
          .filters-grid {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group select, .filter-group input {
            width: 100%;
          }
          .clear-btn {
            width: 100%;
          }
        }
        .clear-btn {
          border: 1px solid var(--color-secondary);
          color: var(--color-secondary);
          padding: var(--spacing-sm) var(--spacing-md);
          height: 42px;
          align-self: flex-start;
        }
        .clear-btn:hover {
          background: var(--color-secondary);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Filters;
