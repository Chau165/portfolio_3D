import { useEffect, useState } from "react";

type SpeechBubbleProps = {
  visible: boolean;
  text: string;
};

export default function SpeechBubble({ visible, text }: SpeechBubbleProps) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (!visible) {
      setIsShown(false);
      return;
    }

    const frameId = window.requestAnimationFrame(() => setIsShown(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`speech-bubble${isShown ? " is-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      {text}
    </div>
  );
}
