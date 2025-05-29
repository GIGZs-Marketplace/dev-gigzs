import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface BitmojiAvatarProps {
  userId: string;
  size?: number;
  className?: string;
}

const BitmojiAvatar: React.FC<BitmojiAvatarProps> = ({ userId, size = 40, className = '' }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Function to fetch profile data
  const fetchProfileAvatar = async () => {
    if (!userId) return;

    // Prevent excessive fetching
    const now = Date.now();
    if (now - lastFetchTime < 5000) return; // Don't fetch more than once every 5 seconds
    setLastFetchTime(now);

    try {
      console.log(`Fetching avatar for user: ${userId}`);

      // Try to fetch from freelancer_profiles first
      const { data: freelancerProfile, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .select('avatar_url, full_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (freelancerProfile) {
        console.log('Found freelancer profile:', freelancerProfile);
        if (freelancerProfile.avatar_url) {
          console.log('Setting freelancer avatar URL:', freelancerProfile.avatar_url);
          setAvatarUrl(freelancerProfile.avatar_url);
        }
        if (freelancerProfile.full_name) {
          setUserName(freelancerProfile.full_name);
        }
        return;
      }

      // If not found, try client_profiles
      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('avatar_url, full_name, company_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (clientProfile) {
        console.log('Found client profile:', clientProfile);
        if (clientProfile.avatar_url) {
          console.log('Setting client avatar URL:', clientProfile.avatar_url);
          setAvatarUrl(clientProfile.avatar_url);
        }
        if (clientProfile.company_name || clientProfile.full_name) {
          setUserName(clientProfile.company_name || clientProfile.full_name || '');
        }
      }
    } catch (error) {
      console.error('Error fetching profile avatar:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchProfileAvatar();

    // Set up real-time subscription for profile picture updates
    const freelancerChannel = supabase
      .channel(`freelancer_avatar_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'freelancer_profiles',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        console.log('Freelancer profile updated in BitmojiAvatar:', payload.new);
        if (payload.new.avatar_url) {
          console.log('Updating avatar URL in BitmojiAvatar:', payload.new.avatar_url);
          setAvatarUrl(payload.new.avatar_url);
        }
        if (payload.new.full_name) {
          setUserName(payload.new.full_name);
        }
      })
      .subscribe();

    const clientChannel = supabase
      .channel(`client_avatar_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'client_profiles',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        console.log('Client profile updated in BitmojiAvatar:', payload.new);
        if (payload.new.avatar_url) {
          console.log('Updating avatar URL in BitmojiAvatar:', payload.new.avatar_url);
          setAvatarUrl(payload.new.avatar_url);
        }
        if (payload.new.company_name || payload.new.full_name) {
          setUserName(payload.new.company_name || payload.new.full_name);
        }
      })
      .subscribe();

    // Refresh the avatar every 30 seconds as a fallback
    const refreshInterval = setInterval(() => {
      fetchProfileAvatar();
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      supabase.removeChannel(freelancerChannel);
      supabase.removeChannel(clientChannel);
    };
  }, [userId]);

  // Generate a consistent avatar based on the user ID as fallback
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
      src={avatarUrl || getAvatarUrl(userId)}
      alt="User Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className} object-cover`}
      onError={(e) => {
        // Fallback to initials if the avatar fails to load
        const target = e.target as HTMLImageElement;
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || userId)}&background=00704A&color=fff`;
      }}
    />
  );
};

export default BitmojiAvatar;