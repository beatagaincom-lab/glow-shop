import {
  useEffect,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 1c1.4 10.4 4.6 13.6 15 15-10.4 1.4-13.6 4.6-15 15C14.6 20.6 11.4 17.4 1 16 11.4 14.6 14.6 11.4 16 1Z" />
    </svg>
  );
}
export function Logo() {
  return (
    <span className="wordmark" aria-label="GLOW">
      GL
      <span className="wordmark-o">
        O<Spark />
      </span>
      W
    </span>
  );
}
export function GlowButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`glow-button ${className}`}>
      <span>{children}</span>
      <span className="button-light" aria-hidden="true">
        <ArrowRight size={21} strokeWidth={1.4} />
      </span>
    </button>
  );
}
export function Quantity({
  value,
  onChange,
  label = "Menge",
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
}) {
  return (
    <div className="quantity" role="group" aria-label={label}>
      <button
        aria-label={`${label} verringern`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={17} />
      </button>
      <output aria-live="polite">{value}</output>
      <button
        aria-label={`${label} erhöhen`}
        disabled={value >= 10}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={17} />
      </button>
    </div>
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Accordion({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="accordion">
      <summary>
        <span>{title}</span>
        <Plus size={18} aria-hidden="true" />
      </summary>
      <div className="accordion-body">{children}</div>
    </details>
  );
}
export function Modal({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) {
      el.showModal();
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        el.close();
        document.body.style.overflow = original;
      };
    }
    el.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`modal ${className}`}
      onCancel={(e) => {
        e.preventDefault();
        close.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close.current();
      }}
    >
      <div className="modal-inner">
        <header className="modal-heading">
          <h2>{title}</h2>
          <button
            autoFocus
            className="icon-button"
            aria-label="Schliessen"
            onClick={onClose}
          >
            <X />
          </button>
        </header>
        {open && children}
      </div>
    </dialog>
  );
}
