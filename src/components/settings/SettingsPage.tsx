import React, { useState, useEffect, useRef } from 'react'

// CSS variable helpers
const setCSSVariables = (theme: string, color: string, fontSize: string) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    // Dark mode settings - ALL text should be white except badges and buttons
    root.style.setProperty('--primary-color', color); // Use the selected color for primary elements
    root.style.setProperty('--primary-text', '#ffffff'); // All text white
    root.style.setProperty('--secondary-bg', '#1e1e1e'); // Darker background
    root.style.setProperty('--tertiary-bg', '#121212'); // Even darker background
    root.style.setProperty('--accent-color', color); // Use selected color for accents
    root.style.setProperty('--card-bg', '#2d2d2d'); // Dark card background
    root.style.setProperty('--border-color', '#444444'); // Dark borders
    root.style.setProperty('--hover-color', '#3a3a3a'); // Dark hover state
    root.style.setProperty('--text-secondary', '#ffffff'); // Secondary text also white
    root.style.setProperty('--text-muted', '#cccccc'); // Only muted text slightly dimmed
    root.style.setProperty('--button-text', '#ffffff'); // Button text white
    root.style.setProperty('--heading-text', '#ffffff'); // Heading text white
    root.style.setProperty('--link-text', color); // Links use the accent color
    // Add dark mode class to body for additional styling hooks
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    // Light mode settings
    root.style.setProperty('--primary-color', color); // Use selected color for primary elements
    root.style.setProperty('--primary-text', '#111827'); // Dark text for light mode
    root.style.setProperty('--secondary-bg', '#ffffff'); // Light background
    root.style.setProperty('--tertiary-bg', '#f9fafb'); // Slightly darker background
    root.style.setProperty('--accent-color', color); // Use selected color for accents
    root.style.setProperty('--card-bg', '#ffffff'); // White card background
    root.style.setProperty('--border-color', '#e5e7eb'); // Light borders
    root.style.setProperty('--hover-color', '#f3f4f6'); // Light hover state
    root.style.setProperty('--text-secondary', '#6b7280'); // Secondary text gray
    root.style.setProperty('--text-muted', '#9ca3af'); // Muted text lighter gray
    root.style.setProperty('--button-text', '#ffffff'); // Button text white
    root.style.setProperty('--heading-text', '#111827'); // Heading text dark
    root.style.setProperty('--link-text', color); // Links use the accent color
    // Add light mode class to body for additional styling hooks
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Set font size
  let fs = '16px';
  if (fontSize === 'small') fs = '14px';
  if (fontSize === 'large') fs = '18px';
  root.style.setProperty('--base-font-size', fs);
};

import { Mail, Lock, BellRing, Globe, Moon, Sun, Palette, User, Shield } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ReactCrop, { Crop, PixelCrop, PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

function SettingsPage() {
  // Appearance tab state
  const colorSchemes = ['#00704A', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');
  const [colorScheme, setColorScheme] = useState<string>(() => localStorage.getItem('colorScheme') || '#00704A');
  const [fontSize, setFontSize] = useState<string>(() => localStorage.getItem('fontSize') || 'medium');

  useEffect(() => {
    setCSSVariables(theme, colorScheme, fontSize);
  }, [theme, colorScheme, fontSize]);

  useEffect(() => {
    // On mount, apply settings
    setCSSVariables(theme, colorScheme, fontSize);
  }, []);

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    // Apply the current color scheme regardless of theme
    setCSSVariables(selectedTheme, colorScheme, fontSize);
  };

  const handleColorSchemeChange = (color: string) => {
    setColorScheme(color);
    localStorage.setItem('colorScheme', color);
    setCSSVariables(theme, color, fontSize);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    setCSSVariables(theme, colorScheme, size);
  };

  // Account tab state
  const [userEmail, setUserEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Fetch user email on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || '');
    })();
  }, []);

  // Change password handler
  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setPasswordSuccess('');
    setPasswordError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }
    // Re-authenticate user by signing in
    const { data: { user }, error: signInErr } = await supabase.auth.signInWithPassword({ email: userEmail, password: currentPassword });
    if (signInErr || !user) {
      setPasswordError('Current password is incorrect.');
      setPasswordLoading(false);
      return;
    }
    // Change password
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    if (updateErr) {
      setPasswordError('Failed to update password.');
    } else {
      setPasswordSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteSuccess('');
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      // Call backend function or admin API to delete user
      // For security, this should be a backend function. Here we just sign out and show a message.
      await supabase.auth.signOut();
      setDeleteSuccess('Account deleted. You have been signed out.');
      // Optionally, redirect or refresh
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
    }
  };


  type TabType = 'profile' | 'account' | 'notifications' | 'appearance';

  var [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80')
  const [showBitmojiModal, setShowBitmojiModal] = useState(false)
  const [selectedBitmoji, setSelectedBitmoji] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<PixelCrop>({ x: 0, y: 0, width: 100, height: 100, unit: 'px' })
  const [croppedImageUrl, setCroppedImageUrl] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)

  // Sample Bitmoji URLs - replace these with actual Bitmoji URLs
  const bitmojis = [
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_1.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_2.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_3.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_4.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_5.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_6.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_7.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_8.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_9.png',
    'https://cdn.jsdelivr.net/gh/alohe/avatars/png/bluey_10.png'
  ]
  

  const handleBitmojiSelect = async (bitmojiUrl: string) => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setSelectedBitmoji(bitmojiUrl);
      setProfilePic(bitmojiUrl);
      setShowBitmojiModal(false);
      
      // Update the profile picture in the database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating profile with bitmoji URL:', bitmojiUrl);

      // Update both profiles to ensure the avatar is updated everywhere
      // First try to update freelancer profile
      const { error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .update({ 
          avatar_url: bitmojiUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (freelancerError) {
        console.log('No freelancer profile found or error updating:', freelancerError);
      } else {
        console.log('Freelancer profile updated with new avatar');
      }

      // Also update client profile (regardless of freelancer update result)
      const { error: clientError } = await supabase
        .from('client_profiles')
        .update({ 
          avatar_url: bitmojiUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (clientError) {
        console.log('No client profile found or error updating:', clientError);
      } else {
        console.log('Client profile updated with new avatar');
      }
      
      // If both updates failed, we have a problem
      if (freelancerError && clientError) {
        throw new Error('Failed to update profile with new avatar');
      }
      
      setProfileSuccess('Profile picture updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setProfileError('Failed to update profile picture: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProfileLoading(false);
    }
  }

  // Editable profile fields for client
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfileLoading(false);
        setProfileError('Not authenticated');
        return;
      }

      try {
        // First try to fetch freelancer profile
        const { data: freelancerData, error: freelancerError } = await supabase
          .from('freelancer_profiles')
          .select('id, full_name, bio, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (freelancerData) {
          // User is a freelancer
          setClientId(freelancerData.id);
          setFullName(freelancerData.full_name || '');
          setBio(freelancerData.bio || '');
          if (freelancerData.avatar_url) {
            setProfilePic(freelancerData.avatar_url);
          }
          setProfileLoading(false);
          return;
        }

        // If not a freelancer, try to fetch client profile
        const { data: clientData, error: clientError } = await supabase
          .from('client_profiles')
          .select('id, full_name, bio, avatar_url')
          .eq('user_id', user.id)
          .single();

        if (clientData) {
          // User is a client
          setClientId(clientData.id);
          setFullName(clientData.full_name || '');
          setBio(clientData.bio || '');
          if (clientData.avatar_url) {
            setProfilePic(clientData.avatar_url);
          }
          setProfileLoading(false);
          return;
        }

        // If we get here, no profile was found
        setProfileError('No profile found for this user');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileError('Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfileError('Not authenticated');
      setProfileLoading(false);
      return;
    }

    try {
      // First try to update freelancer profile
      const { error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .update({ 
          full_name: fullName,
          bio: bio,
          avatar_url: profilePic,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (!freelancerError) {
        setProfileSuccess('Profile updated successfully!');
        setProfileLoading(false);
        return;
      }

      // If not a freelancer, try to update client profile
      const { error: clientError } = await supabase
        .from('client_profiles')
        .update({ 
          full_name: fullName,
          bio: bio,
          avatar_url: profilePic,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (clientError) {
        console.error('Error updating client profile:', clientError);
        throw clientError;
      }

      setProfileSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfilePic = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile picture:', error);
      } else {
        setProfilePic(data.avatar_url);
      }
    };

    fetchProfilePic();
  }, []);

  const bitmojiCanvasRef = useRef<HTMLCanvasElement>(null);

  // Bitmoji selection is now handled by handleBitmojiSelect

  const handleCropComplete = (crop: PixelCrop, percentCrop: PercentCrop) => {
    if (selectedImage && crop.width && crop.height) {
      const image = new Image();
      image.src = selectedImage;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
          );
          const base64Image = canvas.toDataURL('image/jpeg');
          setCroppedImageUrl(base64Image);
        }
      };
    }
  };

  const handleSaveCroppedImage = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');
      
      // Step 1: Fetch the cropped image from the URL
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const fileExt = 'jpeg';
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
  
      console.log('Uploading profile image:', filePath);
      
      // Step 2: Upload the cropped image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob);
  
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error('Failed to upload image: ' + uploadError.message);
      }
  
      // Step 3: Get the public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
  
      if (!publicUrlData) {
        throw new Error('Public URL not found');
      }
  
      const publicUrl = publicUrlData.publicUrl;
      if (!publicUrl) {
        throw new Error('Public URL not found');
      }
      
      console.log('Profile image uploaded successfully:', publicUrl);
  
      // Step 4: Set the profile picture with the valid URL
      setProfilePic(publicUrl);
  
      // Step 5: Update both profiles to ensure the avatar is updated everywhere
      // First try to update freelancer profile
      const { error: freelancerUpdateError } = await supabase
        .from('freelancer_profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (freelancerUpdateError) {
        console.log('No freelancer profile found or error updating:', freelancerUpdateError);
      } else {
        console.log('Freelancer profile updated with new avatar');
      }
  
      // Also update client profile (regardless of freelancer update result)
      const { error: clientUpdateError } = await supabase
        .from('client_profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (clientUpdateError) {
        console.log('No client profile found or error updating:', clientUpdateError);
      } else {
        console.log('Client profile updated with new avatar');
      }
      
      // If both updates failed, we have a problem
      if (freelancerUpdateError && clientUpdateError) {
        throw new Error('Failed to update profile with new avatar');
      }
      
      setProfileSuccess('Profile picture updated successfully!');
      
      // Close the crop modal after saving the image
      setShowCropModal(false);
    } catch (error) {
      console.error('Error saving profile picture:', error);
      setProfileError('Failed to update profile picture: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setProfileLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Settings Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Settings">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'account', label: 'Account', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: BellRing },
            { id: 'appearance', label: 'Appearance', icon: Palette }
          ].map((tab) =>(
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <tab.icon className="mr-2" size={20} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="p-6">
        {activeTab === 'account' && (
          <div className="space-y-8 max-w-xl">
            {/* Email (readonly) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                value={userEmail || ''}
                disabled
                readOnly
              />
            </div>

            {/* Change Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Change Password</label>
              <div className="space-y-2">
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] disabled:opacity-50"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                {passwordSuccess && (
                  <div className="text-green-600 text-sm mt-2">{passwordSuccess}</div>
                )}
                {passwordError && (
                  <div className="text-red-600 text-sm mt-2">{passwordError}</div>
                )}
              </div>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                <p className="text-gray-500 text-xs">Add an extra layer of security to your account.</p>
              </div>
              <button
                onClick={() => setTwoFAEnabled(v => !v)}
                className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${twoFAEnabled ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                {twoFAEnabled ? 'Enabled' : 'Enable'}
              </button>
            </div>

            {/* Danger Zone */}
            <div className="border-t pt-6 border-red-200">
              <h3 className="text-red-700 font-semibold mb-2">Danger Zone</h3>
              <p className="text-sm text-red-600 mb-3">Delete your account and all associated data. This action cannot be undone.</p>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
              {deleteError && (
                <div className="text-red-600 text-sm mt-2">{deleteError}</div>
              )}
              {deleteSuccess && (
                <div className="text-green-600 text-sm mt-2">{deleteSuccess}</div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>

            {/* Editable Name and Bio Section */}
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={profileLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={4}
                  disabled={profileLoading}
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] disabled:opacity-50"
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
              {profileSuccess && (
                <div className="text-green-600 text-sm mt-2">{profileSuccess}</div>
              )}
              {profileError && (
                <div className="text-red-600 text-sm mt-2">{profileError}</div>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
              <div className="relative">
                <button
                  onClick={() => setShowBitmojiModal(!showBitmojiModal)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538] cursor-pointer flex items-center"
                >
                  <span>Choose Bitmoji</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showBitmojiModal && (
                  <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Select a Bitmoji</h3>
                    </div>
                    <div className="p-2 grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                      {bitmojis.map((bitmoji, index) => (
                        <div 
                          key={index}
                          onClick={() => handleBitmojiSelect(bitmoji)}
                          className={`p-1 rounded-md cursor-pointer hover:bg-gray-100 ${selectedBitmoji === bitmoji ? 'ring-2 ring-primary' : ''}`}
                        >
                          <img 
                            src={bitmoji} 
                            alt={`Bitmoji ${index + 1}`} 
                            className="w-12 h-12 mx-auto"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200 text-right">
                      <button 
                        onClick={() => setShowBitmojiModal(false)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Select your preferred Bitmoji
                </p>
              </div>
            </div>

              {showCropModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Crop Photo</h2>
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop: PixelCrop) => setCrop(newCrop)}
                    onComplete={handleCropComplete}
                    circularCrop
                  >
                    <img src={selectedImage || ''} alt="Crop" className="max-w-full" />
                  </ReactCrop>
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setShowCropModal(false)} className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button onClick={handleSaveCroppedImage} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#005538]">Save</button>
                  </div>

                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email"
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-[#00704A]"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="email" className="font-medium text-gray-700">Email Notifications</label>
                            <p className="text-gray-500">Receive email updates about your account activity</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="browser"
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-[#00704A]"
                              defaultChecked
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="browser" className="font-medium text-gray-700">Browser Notifications</label>
                            <p className="text-gray-500">Receive notifications in your browser</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="marketing"
                              type="checkbox"
                              className="rounded border-gray-300 text-primary focus:ring-[#00704A]"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="marketing" className="font-medium text-gray-700">Marketing Emails</label>
                            <p className="text-gray-500">Receive emails about new features and updates</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>
                  )}
                </div>
        )}
        {activeTab === 'appearance' && (
  <div className="space-y-6">
    <h2 className="text-lg font-medium text-gray-900">Appearance Settings</h2>
    <div className="space-y-4">
      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Theme</label>
        <div className="mt-2 space-x-2">
          <button
            className={`inline-flex items-center px-4 py-2 border rounded-lg ${theme === 'light' ? 'bg-[#f3f4f6] border-primary text-primary' : 'border-gray-300 hover:bg-gray-50'}`}
            onClick={() => handleThemeChange('light')}
          >
            <Sun size={20} className="mr-2" /> Light
          </button>
          <button
            className={`inline-flex items-center px-4 py-2 border rounded-lg ${theme === 'dark' ? 'bg-[#111827] border-primary text-white' : 'border-gray-300 hover:bg-gray-50'}`}
            onClick={() => handleThemeChange('dark')}
          >
            <Moon size={20} className="mr-2" /> Dark
          </button>
        </div>
      </div>
      {/* Color Scheme Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Color Scheme</label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {colorSchemes.map((color) => (
            <button
              key={color}
              className={`w-10 h-10 rounded-full border-2 ${colorScheme === color ? 'border-primary ring-2 ring-[#00704A]' : 'border-white ring-2 ring-gray-200 hover:ring-gray-300'}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSchemeChange(color)}
              aria-label={`Switch to ${color} color scheme`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {theme === 'dark' ? 'In dark mode, accent colors will be applied to buttons and highlights.' : 'Choose your preferred color scheme for the entire application.'}
        </p>
      </div>
      {/* Font Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Font Size</label>
        <select
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
          value={fontSize}
          onChange={e => handleFontSizeChange(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  </div>
)}
      </div>
</div>
  )}

export default SettingsPage

// Add these CSS variables to your global stylesheet (e.g., index.css or App.css):
/*
:root {
  --primary-color: #00704A;
  --primary-text: #111827;
  --secondary-bg: #fff;
  --accent-color: #00704A;
  --base-font-size: 16px;
}
body, html {
  background: var(--secondary-bg);
  color: var(--primary-text);
  font-size: var(--base-font-size);
}
.button-primary, .bg-primary {
  background: var(--primary-color) !important;
  color: #fff !important;
}
.text-primary, .text-primary {
  color: var(--primary-color) !important;
}
.border-primary, .border-primary {
  border-color: var(--primary-color) !important;
}
*/

// Make sure to update your main styles to use these CSS variables for all primary/green elements.