import React, { useEffect, useState } from 'react';

export const CursorGlow: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -500, y: -500 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 overflow-hidden"
      style={{ opacity: isVisible ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Primary Cyan Core Glow */}
      <div
        className="absolute rounded-full blur-[90px] mix-blend-screen transition-transform duration-75 ease-out"
        style={{
          width: '450px',
          height: '450px',
          left: `${position.x - 225}px`,
          top: `${position.y - 225}px`,
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
        }}
      />
      {/* Secondary Violet Ambient Follower */}
      <div
        className="absolute rounded-full blur-[140px] mix-blend-screen transition-transform duration-150 ease-out"
        style={{
          width: '700px',
          height: '700px',
          left: `${position.x - 350}px`,
          top: `${position.y - 350}px`,
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 65%)',
        }}
      />
    </div>
  );
};
