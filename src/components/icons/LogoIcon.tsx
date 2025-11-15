import React from 'react';

export const LogoIcon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const { className, ...restProps } = props;
  
  // Extract height from className and convert to pixels - PROFESSIONALLY BALANCED SIZES
  const getHeight = () => {
    if (className?.includes('h-44')) return '80px';  // Desktop extra large (reduced from 176px)
    if (className?.includes('h-40')) return '72px';  // Desktop large (reduced from 160px)
    if (className?.includes('h-36')) return '64px';  // Desktop medium (reduced from 144px)
    if (className?.includes('h-32')) return '56px';  // Desktop small (reduced from 128px)
    if (className?.includes('h-28')) return '50px';  // Tablet (reduced from 112px)
    if (className?.includes('h-24')) return '48px';  // Mobile large (reduced from 96px)
    if (className?.includes('h-20')) return '40px';  // Mobile medium (reduced from 80px)
    if (className?.includes('h-16')) return '32px';  // Mobile small (reduced from 64px)
    if (className?.includes('h-14')) return '28px';  // Mobile small (reduced from 56px)
    return '80px'; // default - professional balanced size
  };
  
  const height = getHeight();
  
  return (
    <div className="logo-container-3d" style={{ height }}>
      <img
        src="/images/traveliq-logo-tiq-x.png"
        alt="TravelIQ - AI Voice Support Network"
        className="logo-premium-3d"
        style={{
          height: height,
          width: 'auto',
          objectFit: 'contain',
          objectPosition: 'left center'
        }}
        {...restProps}
      />
    </div>
  );
};
