const skills = [
  "React",
  "TypeScript",
  "Three.js",
  "R3F",
  "GSAP",
  "Framer Motion",
  "UI Systems",
  "Performance",
];

export default function About() {
  return (
    <section id="about" className="section about-section">
      <div className="section-kicker reveal">About Me</div>
      <div className="about-grid">
        <h2 className="section-title reveal">Frontend craft with motion, depth, and product sense.</h2>
        <div className="about-copy glass-card reveal">
          <p>
            I am Nguyen, a creative frontend developer focused on expressive
            interfaces, crisp interactions, and performant web experiences. I
            enjoy turning product ideas into polished UI systems with the right
            mix of usability, motion, and technical care.
          </p>
          <div className="skill-cloud" aria-label="Skills">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
