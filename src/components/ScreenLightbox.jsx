import { useEffect } from 'react';
import WireframeDisplay from './WireframeDisplay.jsx';

export default function ScreenLightbox({ screen, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!screen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${screen.title} wireframe`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FDFCF9',
          borderRadius: 16,
          padding: '20px 24px 24px',
          maxWidth: '95vw',
          maxHeight: '95vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ✕
        </button>
        <div style={{ marginBottom: 12, paddingRight: 36 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{screen.title}</div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{screen.sub}</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: screen.tagColor || '#777',
              background: `${screen.tagColor || '#777'}18`,
              padding: '2px 9px',
              borderRadius: 10,
            }}
          >
            {screen.tag}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WireframeDisplay svg={screen.svg} size="expanded" />
        </div>
      </div>
    </div>
  );
}
