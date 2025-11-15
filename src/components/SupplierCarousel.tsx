
import React from 'react';
import { Link } from 'react-router-dom';
import { useSuppliers } from '../context/SupplierContext.tsx';

const SupplierCarousel: React.FC = () => {
  const { suppliers } = useSuppliers();

  // Duplicate the array for a seamless, infinite loop effect
  const duplicatedSuppliers = [...suppliers, ...suppliers];

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-logo-scroll">
        {duplicatedSuppliers.map((supplier, index) => (
          <li key={`${supplier.id}-${index}`}>
            <Link to={`/supplier/${supplier.id}`} className="block group" aria-label={`View details for ${supplier.name}`}>
              <img
                src={supplier.logoUrl}
                alt={`${supplier.name} logo`}
                className="h-12 w-auto object-contain transition-all duration-300 transform group-hover:scale-110 group-hover:opacity-90"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplierCarousel;