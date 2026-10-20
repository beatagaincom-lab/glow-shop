import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export default function ScrollGlow({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotation = useTransform(scrollYProgress, [0, 1], [-38, 58]);
  const opacity = useTransform(scrollYProgress, [0, .35, .7, 1], [.25, .9, .75, .2]);
  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const scale = useTransform(scrollYProgress, [0, .5, 1], [.97, 1, .98]);
  return <div ref={ref} className="scroll-glow">
    <motion.div className="scroll-aura" aria-hidden="true" style={{ rotate: reduce ? 0 : rotation, opacity: reduce ? .5 : opacity }} />
    <motion.div className="scroll-orbit" aria-hidden="true" style={{ rotate: reduce ? -12 : rotation }}><i /><i /></motion.div>
    <motion.div className="scroll-photo" style={{ y: reduce ? 0 : y, scale: reduce ? 1 : scale }}>{children}</motion.div>
  </div>;
}
