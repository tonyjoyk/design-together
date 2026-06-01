import { useState, useEffect } from 'react';

const P = { border: '#E8E2D9', primary: '#C4622D', muted: '#777' };

export default function LoadingScreen({ msgs }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= msgs.length - 1) return;
    const t = setTimeout(() => setActive((i) => i + 1), 800);
    return () => clearTimeout(t);
  }, [active, msgs.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '70px 0', gap: '16px' }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          border: `3px solid ${P.border}`,
          borderTopColor: P.primary,
          borderRadius: '50%',
          animation: 'spin .75s linear infinite',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'center' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ fontSize: '13px', color: P.muted, transition: 'opacity .3s', opacity: i === active ? 1 : 0.25 }}>
            {m}
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
