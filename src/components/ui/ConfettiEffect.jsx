import { useEffect, useRef } from 'react';

const CONFETTI_COLORS = ['#7C3AED', '#EC4899', '#F97316', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#14B8A6'];
const SHAPES = ['circle', 'square', 'triangle'];

export default function ConfettiEffect({ active, duration = 3000 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const pieces = [];

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const size = 6 + Math.random() * 10;

      piece.style.left = `${left}%`;
      piece.style.width = `${size}px`;
      piece.style.height = `${size}px`;
      piece.style.backgroundColor = color;
      piece.style.animationDelay = `${delay}s`;
      piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;

      if (shape === 'circle') piece.style.borderRadius = '50%';
      else if (shape === 'square') piece.style.borderRadius = '2px';
      else {
        piece.style.width = '0';
        piece.style.height = '0';
        piece.style.backgroundColor = 'transparent';
        piece.style.borderLeft = `${size / 2}px solid transparent`;
        piece.style.borderRight = `${size / 2}px solid transparent`;
        piece.style.borderBottom = `${size}px solid ${color}`;
      }

      container.appendChild(piece);
      pieces.push(piece);
    }

    const timeout = setTimeout(() => {
      pieces.forEach(p => p.remove());
    }, duration);

    return () => {
      clearTimeout(timeout);
      pieces.forEach(p => p.remove());
    };
  }, [active, duration]);

  if (!active) return null;

  return <div ref={containerRef} className="confetti-container" />;
}
