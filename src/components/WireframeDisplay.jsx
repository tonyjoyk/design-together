export default function WireframeDisplay({ svg, size = 'thumb' }) {
  if (!svg) {
    return (
      <div
        style={{
          width: size === 'expanded' ? 'min(90vw, 360px)' : 'min(100%, 240px)',
          aspectRatio: '320 / 680',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#efefef',
          borderRadius: 14,
          fontSize: 11,
          color: '#777',
        }}
      >
        No wireframe
      </div>
    );
  }

  const svgHtml = svg.replace(/<svg([^>]*)>/i, (match, attrs) => {
    const cleaned = attrs
      .replace(/\s*width="[^"]*"/gi, '')
      .replace(/\s*height="[^"]*"/gi, '');
    return `<svg${cleaned} width="100%" style="display:block;height:auto;">`;
  });

  // Rendered as an image so any script or event handler in AI-generated SVG never runs.
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgHtml)}`;

  return (
    <div
      style={{
        width: size === 'expanded' ? 'min(90vw, 360px)' : 'min(100%, 240px)',
        maxWidth: '100%',
        lineHeight: 0,
      }}
    >
      <img src={src} alt="Wireframe" style={{ display: 'block', width: '100%', height: 'auto' }} />
    </div>
  );
}
