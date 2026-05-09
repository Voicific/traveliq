/**
 * TravelIQ Icon Library
 *
 * Reusable icon components built on lucide-react at a consistent 1.5 stroke weight.
 * All icons follow the TravelIQ design language: thin lines, cyan/blue palette,
 * subtle hover glow. Use FeatureIcon as the container wrapper wherever an icon
 * sits inside a coloured tile (profile cards, feature blocks, section badges).
 *
 * Usage:
 *   import { FeatureIcon, TourOperatorIcon, CruiseIcon } from './TravelIQIcons';
 *
 *   <FeatureIcon size="md" bg="bg-teal-900/40">
 *     <TourOperatorIcon />
 *   </FeatureIcon>
 *
 * Sizes:
 *   sm  → 36×36 container, 16px icon  (inline / compact)
 *   md  → 44×44 container, 20px icon  (profile cards, feature lists)
 *   lg  → 56×56 container, 24px icon  (section hero icons)
 *   xl  → 64×64 container, 28px icon  (page-level badges)
 */

import React from 'react';
import {
  Map,
  Anchor,
  Plane,
  Building2,
  Shield,
  Mountain,
  Globe,
  Bot,
  Users,
  RefreshCw,
  Lock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

const containerSize: Record<IconSize, string> = {
  sm: 'w-9 h-9 rounded-lg',
  md: 'w-11 h-11 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-16 h-16 rounded-2xl',
};

const iconPx: Record<IconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

// ---------------------------------------------------------------------------
// FeatureIcon — container wrapper
// ---------------------------------------------------------------------------

interface FeatureIconProps {
  /** lucide icon element as child */
  children: React.ReactNode;
  size?: IconSize;
  /** Tailwind background class, e.g. "bg-teal-900/40" or "bg-cyan-400/10" */
  bg?: string;
  className?: string;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({
  children,
  size = 'md',
  bg = 'bg-cyan-400/10',
  className = '',
}) => (
  <div
    className={`
      ${containerSize[size]}
      flex items-center justify-center flex-shrink-0
      ${bg}
      border border-white/10
      transition-all duration-200
      ${className}
    `}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// TierIcon — coloured icon tile for sector/profile cards
// Wraps FeatureIcon and picks the right lucide icon by name.
// ---------------------------------------------------------------------------

export type TierIconName =
  | 'tour-operator'
  | 'cruise'
  | 'airline'
  | 'hotel'
  | 'insurance'
  | 'adventure'
  | 'global'
  | 'ai'
  | 'affiliate'
  | 'recurring'
  | 'attribution'
  | 'growth'
  | 'sparkle';

const iconMap: Record<TierIconName, React.FC<{ size: number; className: string }>> = {
  'tour-operator': ({ size, className }) => <Map size={size} strokeWidth={1.5} className={className} />,
  cruise:          ({ size, className }) => <Anchor size={size} strokeWidth={1.5} className={className} />,
  airline:         ({ size, className }) => <Plane size={size} strokeWidth={1.5} className={className} />,
  hotel:           ({ size, className }) => <Building2 size={size} strokeWidth={1.5} className={className} />,
  insurance:       ({ size, className }) => <Shield size={size} strokeWidth={1.5} className={className} />,
  adventure:       ({ size, className }) => <Mountain size={size} strokeWidth={1.5} className={className} />,
  global:          ({ size, className }) => <Globe size={size} strokeWidth={1.5} className={className} />,
  ai:              ({ size, className }) => <Bot size={size} strokeWidth={1.5} className={className} />,
  affiliate:       ({ size, className }) => <Users size={size} strokeWidth={1.5} className={className} />,
  recurring:       ({ size, className }) => <RefreshCw size={size} strokeWidth={1.5} className={className} />,
  attribution:     ({ size, className }) => <Lock size={size} strokeWidth={1.5} className={className} />,
  growth:          ({ size, className }) => <TrendingUp size={size} strokeWidth={1.5} className={className} />,
  sparkle:         ({ size, className }) => <Sparkles size={size} strokeWidth={1.5} className={className} />,
};

interface TierIconProps {
  name: TierIconName;
  size?: IconSize;
  bg?: string;
  /** Tailwind text-color class for the icon stroke */
  color?: string;
  className?: string;
}

export const TierIcon: React.FC<TierIconProps> = ({
  name,
  size = 'md',
  bg = 'bg-cyan-400/10',
  color = 'text-cyan-400',
  className = '',
}) => {
  const IconComponent = iconMap[name];
  return (
    <FeatureIcon size={size} bg={bg} className={className}>
      <IconComponent size={iconPx[size]} className={color} />
    </FeatureIcon>
  );
};

// ---------------------------------------------------------------------------
// Named convenience exports — for one-off usage without TierIcon
// ---------------------------------------------------------------------------

export const TourOperatorIcon = (p: { size?: number; className?: string }) =>
  <Map size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const CruiseIcon = (p: { size?: number; className?: string }) =>
  <Anchor size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const AirlineIcon = (p: { size?: number; className?: string }) =>
  <Plane size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const HotelIcon = (p: { size?: number; className?: string }) =>
  <Building2 size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const InsuranceIcon = (p: { size?: number; className?: string }) =>
  <Shield size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const AdventureIcon = (p: { size?: number; className?: string }) =>
  <Mountain size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const GlobalIcon = (p: { size?: number; className?: string }) =>
  <Globe size={p.size ?? 24} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const AIIcon = (p: { size?: number; className?: string }) =>
  <Bot size={p.size ?? 24} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const AffiliateIcon = (p: { size?: number; className?: string }) =>
  <Users size={p.size ?? 24} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const RecurringIcon = (p: { size?: number; className?: string }) =>
  <RefreshCw size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const AttributionIcon = (p: { size?: number; className?: string }) =>
  <Lock size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const GrowthIcon = (p: { size?: number; className?: string }) =>
  <TrendingUp size={p.size ?? 20} strokeWidth={1.5} className={p.className ?? 'text-cyan-400'} />;

export const SparkleIcon = (p: { size?: number; className?: string }) =>
  <Sparkles size={p.size ?? 14} strokeWidth={1.5} className={p.className ?? 'text-cyan-300'} />;
