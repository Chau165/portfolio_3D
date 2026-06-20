import { motion } from "framer-motion";

const projects = [
  {
    number: "01",
    title: "Immersive Product Landing",
    type: "3D Web Experience",
    stack: "React, R3F, Drei, GSAP",
  },
  {
    number: "02",
    title: "Realtime Dashboard UI",
    type: "Frontend Application",
    stack: "TypeScript, Charts, Motion",
  },
  {
    number: "03",
    title: "Creative Portfolio System",
    type: "Design and Development",
    stack: "Vite, Framer Motion, Lenis",
  },
];

export default function Projects() {
  return (
    <section id="work" className="section projects-section">
      <div className="section-kicker reveal">Selected Work</div>
      <h2 className="section-title reveal">Projects built for clarity, atmosphere, and speed.</h2>

      <div className="project-grid">
        {projects.map((project, index) => (
          <motion.article
            key={project.title}
            className="project-card glass-card reveal"
            whileHover={{ y: -10, rotateX: 3, rotateY: index % 2 ? -3 : 3 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <span className="project-number">{project.number}</span>
            <div className="project-orb parallax-soft" />
            <h3>{project.title}</h3>
            <p>{project.type}</p>
            <div className="project-stack">{project.stack}</div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
