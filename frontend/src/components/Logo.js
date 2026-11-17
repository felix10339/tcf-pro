function Logo({ onClick, clair = false }) {
  return (
    <button type="button" className="logo" onClick={onClick} aria-label="TCF Pro — accueil" style={clair ? { color: '#fff' } : undefined}>
      <span className="logo-marque" aria-hidden="true">T</span>
      <span className="logo-texte">TCF <span>Pro</span></span>
    </button>
  );
}

export default Logo;
