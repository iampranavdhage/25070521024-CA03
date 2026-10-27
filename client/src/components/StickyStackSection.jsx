import React, { useState } from 'react';

/**
 * StickyStackSection — Editorial Monograph Edition
 * Renders stacked dossier sheets that stick and stack cleanly as the user scrolls,
 * creating an elegant magazine / monograph reading experience with strong text hierarchy.
 */
export const StickyStackSection = ({ items = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '64px',
        paddingBottom: '100px',
      }}
    >
      {items.map((item, index) => {
        // Sticky offset calculation: creates a clean document folio stack
        const topOffset = 84 + index * 32;
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={item.id || index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              position: 'sticky',
              top: `${topOffset}px`,
              zIndex: 10 + index,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform, top',
            }}
          >
            {/* Editorial Stacking Sheet */}
            <div
              className="editorial-card"
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: '8px',
                padding: '40px 48px',
                boxShadow: isHovered
                  ? '0 16px 40px -8px rgba(28, 25, 23, 0.1), 0 4px 12px -2px rgba(28, 25, 23, 0.05)'
                  : '0 8px 24px -4px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.03)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '40px',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Top Accent Rule Line */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: item.accentColor || '#c2410c',
                }}
              />

              {/* Editorial Folio / Chapter Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '24px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.7rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#78716c',
                  background: '#f5f4ef',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  border: '1px solid #e7e5e4',
                  fontWeight: 600,
                }}
              >
                FOLIO [0{index + 1}/0{items.length}] · {item.badge || 'SECTION'}
              </div>

              {/* Left Column: Editorial Typographic Hierarchy */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.72rem',
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: item.accentColor || '#c2410c',
                      fontWeight: 700,
                    }}
                  >
                    {item.category || `ARTICLE // 0${index + 1}`}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                    fontWeight: 500,
                    letterSpacing: '-0.025em',
                    color: '#1c1917',
                    lineHeight: 1.18,
                    marginBottom: '14px',
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.98rem',
                    color: '#57534e',
                    lineHeight: 1.68,
                    maxWidth: '520px',
                    marginBottom: '28px',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                >
                  {item.description}
                </p>

                {item.stats && (
                  <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    {item.stats.map((st, i) => (
                      <div
                        key={i}
                        style={{
                          borderLeft: '2px solid #e7e5e4',
                          paddingLeft: '14px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.6rem',
                            fontWeight: 500,
                            color: '#1c1917',
                            fontFamily: 'Newsreader, Georgia, serif',
                            fontStyle: 'italic',
                            lineHeight: 1.1,
                          }}
                        >
                          {st.value}
                        </div>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: '#8c827a',
                            textTransform: 'uppercase',
                            fontFamily: 'JetBrains Mono, monospace',
                            letterSpacing: '0.08em',
                            marginTop: '4px',
                            fontWeight: 600,
                          }}
                        >
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Clean Editorial Specimen Box */}
              <div
                style={{
                  background: '#faf8f5',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e7e5e4',
                    paddingBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#78716c',
                      fontWeight: 600,
                    }}
                  >
                    {item.codeSnippetTitle || 'SPECIMEN · ARCHITECTURE'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#a8a29e', fontFamily: 'Newsreader, serif', fontStyle: 'italic' }}>
                    Live Record
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#44403c', lineHeight: 1.65 }}>
                  {item.previewContent}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StickyStackSection;
