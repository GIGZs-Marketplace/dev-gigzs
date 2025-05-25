import React from 'react';

interface BitmojiAvatarProps {
  userId: string;
  size?: number;
  className?: string;
}

const BitmojiAvatar: React.FC<BitmojiAvatarProps> = ({ userId, size = 40, className = '' }) => {
  // Generate a consistent avatar based on the user ID
  const getAvatarUrl = (id: string) => {
    // Use a hash function to generate consistent colors
    const hash = id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Generate a color based on the hash
    const hue = Math.abs(hash % 360);
    const saturation = 70 + (hash % 30); // 70-100%
    const lightness = 45 + (hash % 10); // 45-55%
    
    // Generate a unique avatar using DiceBear's avataaars style
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}&backgroundColor=${encodeURIComponent(`hsl(${hue},${saturation}%,${lightness}%)`)}`;
  };

  return (
    <img
      src={getAvatarUrl(userId)}
      alt="User Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={(e) => {
        // Fallback to initials if the avatar fails to load
        const target = e.target as HTMLImageElement;
        target.src = `https://ui-avatars.com/api/?name=${userId}&background=00704A&color=fff`;
      }}
    />
  );
};

export default BitmojiAvatar; 