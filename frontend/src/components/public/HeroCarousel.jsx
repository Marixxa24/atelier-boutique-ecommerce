import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';

const slidesData = [
  {
    id: 1,
    tag: "NUEVA COLECCIÓN",
    season: "Otoño / Invierno 2026",
    headline: "La Poesía de la Sastrería Contemporánea",
    description: "Prendas esculpidas con lino noble, satén de seda pura y tonalidades cálidas inspiradas en la tierra y el moca.",
    cta: "Comprar Look",
    categoryTarget: "Colección",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
  },
  {
    id: 2,
    tag: "CÁPSULA EXCLUSIVA",
    season: "Edición Limitada 2026",
    headline: "Siluetas Fluidas & Tonos Vainilla",
    description: "Sets minimalistas pensados para trascender las temporadas con elegancia serena y confort absoluto.",
    cta: "Ver Sets",
    categoryTarget: "Sets",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85"
  },
  {
    id: 3,
    tag: "ESENCIALES ATELIER",
    season: "Línea Prêt-à-Porter",
    headline: "Estructuras Precisas en Lino & Crepe",
    description: "Prendas de autor con corte perfecto, diseñadas para elevar la rutina diaria a una experiencia estética.",
    cta: "Explorar Tops & Pantalones",
    categoryTarget: "Pantalones",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85"
  }
];

const HeroCarousel = ({ onExploreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const duration = 6000; // 6 seconds per slide

  useEffect(() => {
    const step = 50;
    const increment = (step / duration) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slidesData.length);
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesData.length) % slidesData.length);
    setProgress(0);
  };

  const slide = slidesData[currentSlide];

  return (
    <section style={styles.heroWrapper}>
      {/* Background Slides */}
      {slidesData.map((s, index) => (
        <div
          key={s.id}
          style={{
            ...styles.slideBackground,
            backgroundImage: `linear-gradient(to right, rgba(56, 41, 35, 0.72) 0%, rgba(56, 41, 35, 0.35) 60%, rgba(56, 41, 35, 0.1) 100%), url(${s.image})`,
            opacity: index === currentSlide ? 1 : 0,
            transform: index === currentSlide ? 'scale(1)' : 'scale(1.04)',
            transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      ))}

      {/* Slide Content */}
      <div className="container" style={styles.contentContainer}>
        <div style={styles.textContent}>
          <div style={styles.tagBadge}>
            <span style={styles.dot}></span>
            <span>{slide.tag} • {slide.season}</span>
          </div>

          <h1 style={styles.title}>
            {slide.headline}
          </h1>

          <p style={styles.description}>
            {slide.description}
          </p>

          <div style={styles.actions}>
            <button
              onClick={() => onExploreClick && onExploreClick(slide.categoryTarget)}
              className="btn-accent"
              style={styles.ctaBtn}
            >
              <span>{slide.cta}</span>
              <FiArrowRight style={{ fontSize: '18px' }} />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('catalogo-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              style={styles.ghostBtn}
            >
              Ver Catálogo Completo
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="container" style={styles.controlsBar}>
        {/* Number indicator 01 / 03 */}
        <div style={styles.paginationNumber}>
          <span style={styles.activeNumber}>0{currentSlide + 1}</span>
          <span style={styles.divider}>/</span>
          <span style={styles.totalNumber}>0{slidesData.length}</span>
        </div>

        {/* Progress Bars */}
        <div style={styles.progressContainer}>
          {slidesData.map((_, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentSlide(idx);
                setProgress(0);
              }}
              style={styles.progressBarWrapper}
            >
              <div
                style={{
                  ...styles.progressBarFill,
                  width: idx === currentSlide ? `${progress}%` : idx < currentSlide ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Minimalist Arrow Controls */}
        <div style={styles.arrowsGroup}>
          <button onClick={handlePrev} style={styles.arrowBtn} aria-label="Slide anterior">
            <FiChevronLeft size={20} />
          </button>
          <button onClick={handleNext} style={styles.arrowBtn} aria-label="Slide siguiente">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  heroWrapper: {
    position: 'relative',
    height: '84vh',
    minHeight: '620px',
    maxHeight: '880px',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#281F1B'
  },
  slideBackground: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 25%',
    backgroundRepeat: 'no-repeat',
    zIndex: 1
  },
  contentContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    paddingBottom: '60px'
  },
  textContent: {
    maxWidth: '680px',
    color: '#FFFFFF'
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(251, 248, 243, 0.18)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#FBF8F3',
    marginBottom: '20px'
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent-soft)'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 'clamp(36px, 5vw, 62px)',
    fontWeight: '500',
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    marginBottom: '20px',
    textShadow: '0 2px 12px rgba(0,0,0,0.3)'
  },
  description: {
    fontSize: 'clamp(15px, 1.8vw, 18px)',
    color: 'rgba(251, 248, 243, 0.9)',
    lineHeight: 1.6,
    marginBottom: '36px',
    fontWeight: '300',
    maxWidth: '560px'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    flexWrap: 'wrap'
  },
  ctaBtn: {
    padding: '16px 36px',
    fontSize: '15px'
  },
  ghostBtn: {
    color: '#FFFFFF',
    borderBottom: '1px solid rgba(255,255,255,0.6)',
    padding: '8px 4px',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.04em',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  controlsBar: {
    position: 'absolute',
    bottom: '36px',
    left: 0,
    right: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '24px'
  },
  paginationNumber: {
    color: '#FFFFFF',
    fontFamily: 'var(--font-sans)',
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    fontSize: '15px',
    fontWeight: '500'
  },
  activeNumber: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#FFFFFF'
  },
  divider: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '14px'
  },
  totalNumber: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px'
  },
  progressContainer: {
    display: 'flex',
    gap: '12px',
    flex: 1,
    maxWidth: '360px'
  },
  progressBarWrapper: {
    flex: 1,
    height: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '2px',
    overflow: 'hidden',
    cursor: 'pointer',
    padding: '6px 0',
    backgroundClip: 'content-box'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '2px',
    transition: 'width 0.05s linear'
  },
  arrowsGroup: {
    display: 'flex',
    gap: '10px'
  },
  arrowBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'rgba(251, 248, 243, 0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }
};

export default HeroCarousel;
