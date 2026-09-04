import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroCarousel from '../../components/public/HeroCarousel';
import ProductCard from '../../components/public/ProductCard';
import { FiArrowRight, FiTag, FiStar, FiLayers } from 'react-icons/fi';

const fallbackProducts = [
  {
    _id: "demo1",
    name: "Blusa de Seda Noir",
    sku: "TOP-NOIR-01",
    description: "Blusa confeccionada en satén de seda pura con caída fluida y escote drapeado.",
    price: 48500,
    category: "Tops",
    status: "Activo",
    isPromo: true,
    discountPercent: 15,
    promoBadge: "15% OFF",
    compareAtPrice: 57000,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80"],
    inventory: [
      { color: "Negro Moca", hex: "#241E1C", sizes: { XS: 4, S: 8, M: 6, L: 2, XL: 1 } },
      { color: "Marfil Seda", hex: "#F7F3EE", sizes: { XS: 2, S: 5, M: 4, L: 0, XL: 0 } }
    ]
  },
  {
    _id: "demo2",
    name: "Pantalón Sastrería Lino Crudo",
    sku: "PAN-LINO-02",
    description: "Pantalón wide leg de tiro alto confeccionado en 100% lino orgánico pesado.",
    price: 64900,
    category: "Pantalones",
    status: "Activo",
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"],
    inventory: [
      { color: "Lino Crudo", hex: "#E7DFC6", sizes: { XS: 1, S: 1, M: 0, L: 0, XL: 0 } },
      { color: "Terracota Cálido", hex: "#B86B53", sizes: { XS: 3, S: 6, M: 5, L: 3, XL: 2 } }
    ]
  },
  {
    _id: "demo3",
    name: "Set Minimalista Vainilla",
    sku: "SET-VAIN-03",
    description: "Conjunto de crop top estructurado y falda midi tubo con tajo lateral.",
    price: 71200,
    category: "Sets",
    status: "Activo",
    isPromo: true,
    discountPercent: 20,
    promoBadge: "SALE 20% OFF",
    compareAtPrice: 89000,
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"],
    inventory: [
      { color: "Vainilla Nube", hex: "#F9F5EC", sizes: { XS: 2, S: 4, M: 3, L: 1, XL: 0 } },
      { color: "Rosa Nube", hex: "#ECCDC5", sizes: { XS: 1, S: 0, M: 0, L: 0, XL: 0 } }
    ]
  },
  {
    _id: "demo4",
    name: "Trench Coat Oversized Arena",
    sku: "ABR-TREN-04",
    description: "Gabardina premium en corte oversized contemporáneo con cinturón con hebilla forrada.",
    price: 135000,
    category: "Colección",
    status: "Activo",
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"],
    inventory: [
      { color: "Arena Desierto", hex: "#D6C7B2", sizes: { XS: 3, S: 5, M: 4, L: 2, XL: 1 } }
    ]
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  const fetchHomeProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/products?status=Activo');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.length > 0 ? data : fallbackProducts);
      } else {
        setProducts(fallbackProducts);
      }
    } catch (err) {
      setProducts(fallbackProducts);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Featured / New launches (either isFeatured or top 4 new products)
  const featuredProducts = products.filter(p => p.isFeatured);
  const newArrivals = (featuredProducts.length >= 3 ? featuredProducts : products).slice(0, 4);

  // 2. Promotional products
  const promoProducts = products.filter(p => p.isPromo).slice(0, 4);

  return (
    <div>
      {/* 1. Hero Carousel */}
      <HeroCarousel
        onExploreClick={(cat) => {
          if (cat) {
            navigate(`/catalogo?categoria=${encodeURIComponent(cat)}`);
          } else {
            navigate('/catalogo');
          }
        }}
      />

      {/* 2. Sección: Nuevos Lanzamientos & Tendencias (Muestra Curada) */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <div style={styles.sectionSubtitleWrapper}>
              <FiStar size={14} style={{ color: 'var(--color-accent-secondary)' }} />
              <span style={styles.sectionSubtitle}>CURADURÍA DE TEMPORADA</span>
            </div>
            <h2 style={styles.sectionTitle}>Nuevos Lanzamientos & Esenciales</h2>
            <p style={styles.sectionDesc}>
              Una muestra exclusiva de piezas clave diseñadas para elevar tu estilo cotidiano.
            </p>
          </div>

          {isLoading ? (
            <div style={styles.loadingBox}>
              <div style={styles.spinner} />
            </div>
          ) : (
            <div style={styles.productGrid}>
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link to="/catalogo" className="btn-secondary" style={styles.viewAllBtn}>
              <span>Ver Catálogo Completo</span>
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Sección: Promociones & Descuentos Especiales */}
      {promoProducts.length > 0 && (
        <section style={{ ...styles.section, backgroundColor: 'var(--color-bg-base)', borderTop: '1px solid rgba(125, 110, 101, 0.1)' }}>
          <div className="container">
            <div style={styles.sectionHeader}>
              <div style={styles.sectionSubtitleWrapper}>
                <FiTag size={14} style={{ color: 'var(--color-accent-alert)' }} />
                <span style={{ ...styles.sectionSubtitle, color: 'var(--color-accent-alert)' }}>
                  OPORTUNIDADES DE TEMPORADA
                </span>
              </div>
              <h2 style={styles.sectionTitle}>Prendas con Descuento Especial</h2>
              <p style={styles.sectionDesc}>
                Aprovecha piezas de colección con precios promocionales por tiempo limitado.
              </p>
            </div>

            <div style={styles.productGrid}>
              {promoProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <Link to="/catalogo?promo=true" className="btn-accent" style={styles.viewAllBtn}>
                <span>Ver Todas las Promociones</span>
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Banner Destacado: Catálogo Completo */}
      <section style={styles.fullCatalogBanner}>
        <div className="container" style={styles.bannerInner}>
          <div style={{ maxWidth: '640px' }}>
            <span style={styles.bannerPretitle}>EXPLORA TODA NUESTRA OFERTA</span>
            <h2 style={styles.bannerHeading}>¿Buscas un corte, color o talle en particular?</h2>
            <p style={styles.bannerText}>
              Accede a nuestro catálogo completo con <strong>barra de filtros avanzada</strong> por color cromático, categorías, talles (XS a XL) y rangos de precio.
            </p>
            <Link to="/catalogo" className="btn-primary" style={{ padding: '14px 28px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FiLayers size={16} />
              <span>Ingresar al Catálogo con Filtros</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Editorial Spotlight Banner */}
      <section style={styles.editorialBanner}>
        <div className="container" style={styles.bannerGrid}>
          <div style={styles.bannerText}>
            <span style={styles.bannerTag}>FILOSOFÍA ATELIER</span>
            <h2 style={styles.bannerTitle}>El Arte de Vestir Despacio y con Propósito</h2>
            <p style={styles.bannerParagraph}>
              Cada colección es confeccionada en tiradas reducidas para garantizar la exclusividad y la preservación de los procesos artesanales. Prendas creadas para permanecer en tu guardarropa por temporadas enteras.
            </p>
            <div style={styles.quoteCard}>
              <p style={styles.quoteText}>"La verdadera elegancia reside en la serenidad de los cortes puros y los materiales nobles."</p>
              <span style={styles.quoteAuthor}>— Valentina Atelier, Directora Creativa</span>
            </div>
          </div>
          <div style={styles.bannerImageContainer}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"
              alt="Editorial Atelier"
              style={styles.bannerImage}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  section: {
    padding: '80px 0 90px 0'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '44px'
  },
  sectionSubtitleWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  sectionSubtitle: {
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.14em',
    color: 'var(--color-accent-secondary)',
    textTransform: 'uppercase'
  },
  sectionTitle: {
    fontSize: 'clamp(28px, 3.5vw, 42px)',
    margin: '0 0 10px 0',
    fontWeight: '600'
  },
  sectionDesc: {
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    maxWidth: '540px',
    margin: '0 auto'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '36px 28px'
  },
  viewAllBtn: {
    padding: '12px 28px',
    fontSize: '13px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none'
  },
  fullCatalogBanner: {
    backgroundColor: 'var(--color-surface-soft)',
    padding: '70px 0',
    borderTop: '1px solid rgba(125, 110, 101, 0.1)',
    borderBottom: '1px solid rgba(125, 110, 101, 0.1)'
  },
  bannerInner: {
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  bannerPretitle: {
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.14em',
    color: 'var(--color-accent-secondary)',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: '8px'
  },
  bannerHeading: {
    fontSize: 'clamp(26px, 3vw, 36px)',
    lineHeight: '1.25',
    marginBottom: '14px'
  },
  bannerText: {
    fontSize: '15px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.6',
    marginBottom: '26px'
  },
  editorialBanner: {
    backgroundColor: 'var(--color-surface)',
    padding: '90px 0'
  },
  bannerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '64px',
    alignItems: 'center'
  },
  bannerText: {
    display: 'flex',
    flexDirection: 'column'
  },
  bannerTag: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    color: 'var(--color-accent-secondary)',
    marginBottom: '12px'
  },
  bannerTitle: {
    fontSize: 'clamp(28px, 3.5vw, 42px)',
    lineHeight: '1.2',
    marginBottom: '20px'
  },
  bannerParagraph: {
    fontSize: '15px',
    color: 'var(--color-text-muted)',
    lineHeight: '1.7',
    marginBottom: '28px'
  },
  quoteCard: {
    borderLeft: '2px solid var(--color-accent-secondary)',
    paddingLeft: '20px',
    fontStyle: 'italic'
  },
  quoteText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '18px',
    color: 'var(--color-text-main)',
    marginBottom: '6px'
  },
  quoteAuthor: {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    fontWeight: '600',
    fontStyle: 'normal'
  },
  bannerImageContainer: {
    aspectRatio: '4/5',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-lg)'
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  loadingBox: {
    padding: '60px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid var(--color-surface-soft)',
    borderTop: '3px solid var(--color-text-main)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default Home;
