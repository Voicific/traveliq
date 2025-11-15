import React from 'react';

interface LiveAvatarProps {
  isSpeaking: boolean;
}

export const LiveAvatar: React.FC<LiveAvatarProps> = ({ isSpeaking }) => {
  const speakingClasses = isSpeaking ? 'animate-pulse' : '';
  const coreSpeakingClasses = isSpeaking ? 'scale-110 opacity-100' : 'scale-100 opacity-80';
  const glowSpeakingClasses = isSpeaking ? 'opacity-70 scale-125' : 'opacity-40 scale-100';

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-transparent">
      {/* Outer Glow */}
      <div 
        className={`absolute w-2/3 h-2/3 bg-brand-cyan rounded-full blur-3xl transition-all duration-500 ${glowSpeakingClasses}`}
        style={{ animationDelay: '0.2s', animationDuration: '3s' }}
      ></div>
      
      {/* Inner Orb */}
      <div className={`w-3/4 h-3/4 bg-brand-bg rounded-full border-2 border-brand-cyan/30 flex items-center justify-center ${speakingClasses}`}>
        {/* Core */}
        <div 
            className={`w-2/3 h-2/3 bg-gradient-to-tr from-brand-cyan to-brand-magenta rounded-full blur-xl transition-all duration-500 ${coreSpeakingClasses}`}
            style={{ animationDuration: '2s' }}
        ></div>
      </div>

       {/* Grid Pattern Overlay */}
      <svg className="absolute w-full h-full text-cyan-400/10" width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};
