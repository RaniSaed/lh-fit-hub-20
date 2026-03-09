import React from 'react';

export const LHLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl' };
  return (
    <span className={`${sizes[size]} font-display font-bold tracking-tight`}>
      <span className="text-primary">L</span>
      <span className="text-secondary">H</span>
    </span>
  );
};
