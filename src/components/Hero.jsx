import React from 'react';

const Hero = ({ onSearch, searchValue }) => {
  const [inputValue, setInputValue] = React.useState(searchValue || '');

  // Sync local state with prop when prop changes (e.g. cleared externally)
  React.useEffect(() => {
    setInputValue(searchValue || '');
  }, [searchValue]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (onSearch) onSearch(value);
  };

  const handleButtonClick = () => {
    if (onSearch) onSearch(inputValue);
  };

  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h2 className="hero-title">Encuentra tu hogar ideal</h2>
        <p className="hero-subtitle">Las mejores propiedades en exclusiva para ti</p>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar por ubicación, tipo de propiedad..." 
            className="search-input"
            value={inputValue}
            onChange={handleChange}
          />
          <button className="btn btn-secondary search-btn" onClick={handleButtonClick}>Buscar</button>
        </div>
      </div>
      <style>{`
        .hero {
          background-image: url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
          background-size: cover;
          background-position: center;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-white);
        }
        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }
        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          width: 100%;
          max-width: 800px;
          padding: 0 var(--spacing-md);
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .hero-subtitle {
          font-size: var(--font-size-xl);
          margin-bottom: var(--spacing-2xl);
          opacity: 0.95;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        .search-bar {
          background: var(--color-white);
          padding: var(--spacing-sm);
          border-radius: 8px;
          display: flex;
          gap: var(--spacing-sm);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .search-input {
          flex: 1;
          border: none;
          padding: var(--spacing-md);
          font-size: var(--font-size-base);
          outline: none;
        }
        .search-btn {
          padding: var(--spacing-md) var(--spacing-2xl);
        }

        @media (max-width: 768px) {
          .hero {
            height: 500px;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-subtitle {
            font-size: var(--font-size-lg);
          }
          .search-bar {
            flex-direction: column;
            padding: var(--spacing-md);
          }
          .search-btn {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
