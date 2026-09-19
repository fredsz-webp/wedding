import React from 'react';

/**
 * Divider motif batik kawung — lingkaran berjalinan emas.
 * Pengganti garis polos agar beridentitas Jawa.
 */
export const KawungDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  const circles = [0, 1, 2, 3, 4];
  return (
    <div className={`flex items-center justify-center gap-0 ${className}`} aria-hidden>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-400/70" />
      <svg width="104" height="16" viewBox="0 0 104 16" fill="none" aria-hidden>
        <g stroke="#c5941c" strokeWidth="1.1" opacity="0.85">
          {circles.map((i) => (
            <React.Fragment key={i}>
              <circle cx={12 + i * 20} cy="8" r="6.5" />
              <circle cx={12 + i * 20} cy="8" r="2" fill="#c5941c" stroke="none" opacity="0.9" />
            </React.Fragment>
          ))}
        </g>
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-400/70" />
    </div>
  );
};

export default KawungDivider;
