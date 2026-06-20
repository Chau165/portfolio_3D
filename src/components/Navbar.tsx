const navItems = [
  { label: "ABOUT", href: "#about" },
  { label: "WORK", href: "#work" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <a className="brand" href="#home" aria-label="Nguyen portfolio home">
        <span className="brand-mark">N</span>
        <span>nguyen.dev</span>
      </a>

      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} className="nav-link" href={item.href}>
            <span>{item.label}</span>
            <span aria-hidden="true">{item.label}</span>
          </a>
        ))}
      </nav>

      <a className="nav-email" href="mailto:hello@nguyen.dev">
        hello@nguyen.dev
      </a>
    </header>
  );
}
