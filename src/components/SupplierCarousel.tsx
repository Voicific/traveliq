
import React from 'react';
import { Link } from 'react-router-dom';
import { SEED_SUPPLIERS } from '../constants.ts';
import { useSuppliers } from '../context/SupplierContext.tsx';
import { TIER_RANK } from '../types.ts';

const SupplierCarousel: React.FC = () => {
  // Static seed data keeps the carousel populated regardless of DB state; the
  // live list only supplies each supplier's tier, which sets the order
  // (featured → priority → standard).
  const { suppliers } = useSuppliers();
  const tierById = new Map(suppliers.map(s => [s.id, s.tier ?? 'free']));
  const ordered = [...SEED_SUPPLIERS].sort(
    (a, b) => TIER_RANK[tierById.get(a.id) ?? 'free'] - TIER_RANK[tierById.get(b.id) ?? 'free'],
  );
  const duplicatedSuppliers = [...ordered, ...ordered];

  return (
    <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-logo-scroll hover:[animation-play-state:paused]">
        {duplicatedSuppliers.map((supplier, index) => (
          <li key={`${supplier.id}-${index}`}>
            <Link to={`/supplier/${supplier.id}`} className="block group" aria-label={`View details for ${supplier.name}`}>
              <img
                src={supplier.logoUrl}
                alt={`${supplier.name} logo`}
               className="h-12 w-auto object-contain transition-all duration-300 transform group-hover:scale-110 group-hover:opacity-90 bg-white/90 p-2 rounded-lg"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplierCarousel;
