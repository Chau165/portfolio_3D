import { KeyboardEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Group } from "three";
import Avatar from "./Avatar";
import SpeechBubble from "./SpeechBubble";

const socials = [
  { label: "GH", href: "https://github.com/" },
  { label: "IN", href: "https://www.linkedin.com/" },
  { label: "FB", href: "https://www.facebook.com/" },
];

const HERO_AVATAR_X = 0.02;
const HERO_AVATAR_Y = -1.34;
const ABOUT_AVATAR_X = -0.96;
const ABOUT_AVATAR_Y = -1.28;

function LoadingModel() {
  return (
    <Html center>
      <div className="model-loader">Loading avatar</div>
    </Html>
  );
}

export default function Hero3D() {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [activationSignal, setActivationSignal] = useState(0);
  const avatarScrollGroup = useRef<Group>(null);
  const avatarStage = useRef<HTMLDivElement>(null);
  const bubbleTimer = useRef<number>();

  const showBubble = useCallback(() => {
    setBubbleVisible(true);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubbleVisible(false), 2500);
  }, []);

  const activateAvatar = useCallback(() => {
    setActivationSignal((signal) => signal + 1);
    showBubble();
  }, [showBubble]);

  const handleAvatarKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activateAvatar();
  };

  useEffect(() => {
    return () => window.clearTimeout(bubbleTimer.current);
  }, []);

  useEffect(() => {
    let frameId = 0;
    let timeline: gsap.core.Timeline | null = null;
    let removeScrollListeners: (() => void) | null = null;

    const setupScrollTransition = () => {
      if (!avatarScrollGroup.current || !avatarStage.current) {
        frameId = window.requestAnimationFrame(setupScrollTransition);
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.matchMedia("(max-width: 760px)").matches;
      const group = avatarScrollGroup.current;
      const stage = avatarStage.current;

      group.position.set(HERO_AVATAR_X, HERO_AVATAR_Y, 0);
      group.rotation.set(0, 0, 0);
      group.scale.setScalar(1);

      if (reduceMotion || isMobile) {
        gsap.set(stage, { autoAlpha: 1 });
        return;
      }

      gsap.set(stage, { autoAlpha: 1 });

      const about = document.querySelector<HTMLElement>("#about");
      const aboutElements =
        ".about-section .section-kicker, .about-section .section-title, .about-section .about-copy";

      timeline = gsap.timeline({ defaults: { ease: "none" }, paused: true });

      timeline
        .to(group.position, { x: ABOUT_AVATAR_X, y: ABOUT_AVATAR_Y, z: 0 }, 0)
        .to(group.rotation, { x: 0.05, y: 0.45, z: -0.03 }, 0)
        .to(group.scale, { x: 1.25, y: 1.25, z: 1.25 }, 0)
        .fromTo(
          aboutElements,
          { autoAlpha: 0, x: 70, y: 20 },
          { autoAlpha: 1, x: 0, y: 0, stagger: 0.05 },
          0.28,
        );

      const updateFromScroll = () => {
        const end = Math.max(window.innerHeight, about?.offsetTop ?? window.innerHeight);
        const progress = gsap.utils.clamp(0, 1, window.scrollY / end);
        timeline?.progress(progress);

        if (window.scrollY <= 2) {
          gsap.set(stage, { position: "absolute", autoAlpha: 1 });
        } else if (window.scrollY <= end + window.innerHeight * 0.55) {
          gsap.set(stage, { position: "fixed", autoAlpha: 1 });
        } else {
          gsap.set(stage, { position: "absolute", autoAlpha: 0 });
        }
      };

      let ticking = false;
      const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
          updateFromScroll();
        });
      };

      window.addEventListener("scroll", requestUpdate, { passive: true });
      window.addEventListener("resize", requestUpdate);
      updateFromScroll();

      removeScrollListeners = () => {
        window.removeEventListener("scroll", requestUpdate);
        window.removeEventListener("resize", requestUpdate);
      };
    };

    setupScrollTransition();

    return () => {
      window.cancelAnimationFrame(frameId);
      removeScrollListeners?.();
      timeline?.kill();

      if (avatarStage.current) {
        gsap.set(avatarStage.current, { clearProps: "position,autoAlpha" });
      }

      if (avatarScrollGroup.current) {
        avatarScrollGroup.current.position.set(HERO_AVATAR_X, HERO_AVATAR_Y, 0);
        avatarScrollGroup.current.rotation.set(0, 0, 0);
        avatarScrollGroup.current.scale.setScalar(1);
      }
    };
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-noise" />
      <div className="hero-glow hero-glow-left" />
      <div className="hero-glow hero-glow-right" />

      <aside className="social-rail" aria-label="Social links">
        <span />
        {socials.map((social) => (
          <a key={social.label} href={social.href} target="_blank" rel="noreferrer">
            {social.label}
          </a>
        ))}
      </aside>

      <motion.div
        className="hero-copy hero-copy-left"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="eyebrow">A premium 3D portfolio</p>
        <h1>Hello! I'm Nguyen</h1>
      </motion.div>

      <motion.div
        className="hero-copy hero-copy-right"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
      >
        <p className="eyebrow">Interactive frontend craft</p>
        <h2>Creative Frontend Developer</h2>
      </motion.div>

      <div ref={avatarStage} className="avatar-stage" aria-label="Interactive 3D character">
        <Canvas
          camera={{ position: [0, 1.2, 5], fov: 38 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          shadows
        >
          <ambientLight intensity={1.15} />
          <directionalLight
            position={[2.5, 4, 3]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-2.8, 1.8, 2.4]} intensity={4.2} color="#ff78da" />
          <pointLight position={[2.8, 2.1, -1.7]} intensity={5} color="#8d63ff" />
          <spotLight
            position={[0, 4.6, -2.4]}
            angle={0.5}
            penumbra={0.8}
            intensity={2.3}
            color="#d9c3ff"
          />
          <Suspense fallback={<LoadingModel />}>
            <group ref={avatarScrollGroup} position={[HERO_AVATAR_X, HERO_AVATAR_Y, 0]}>
              <Avatar activationSignal={activationSignal} onActivate={showBubble} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      <button
        className="avatar-focus-button"
        type="button"
        aria-label="Activate Nguyen avatar"
        onClick={activateAvatar}
        onKeyDown={handleAvatarKeyDown}
      />

      <SpeechBubble visible={bubbleVisible} text="Xin Chào" />

      <div className="scroll-hint">Scroll</div>
    </section>
  );
}
