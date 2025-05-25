import React, { useState, useEffect } from 'react'
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  GraduationCap,
  Edit2,
  Plus,
  Save,
  X,
  Github,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

interface SocialLinks {
  github: string;
}

interface Experience {
  id: number | string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: number | string;
  degree: string;
  institution: string;
  year: string;
}

interface ProfileState {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website_url: string;
  bio: string;
  hourlyRate: string;
  avatar_url: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  socialLinks: SocialLinks;
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [profile, setProfile] = useState<ProfileState>({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website_url: '',
    bio: '',
    hourlyRate: '',
    avatar_url: '',
    skills: [],
    experience: [],
    education: [],
    socialLinks: {
      github: ''
    }
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // First get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('No user found')

      console.log('Loading profile for user:', user.id)

      // Get or create the freelancer profile for this user
      let { data: freelancerProfile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Freelancer profile response:', { freelancerProfile, profileError })

      // If no profile exists, create one
      if (profileError && profileError.code === 'PGRST116') {
        console.log('No profile found, creating a new one')
        const { data: newProfile, error: createError } = await supabase
          .from('freelancer_profiles')
          .insert([{ 
            user_id: user.id,
            full_name: user.user_metadata?.full_name || '',
            professional_title: '',
            skills: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (createError) throw createError
        
        freelancerProfile = newProfile
        profileError = null
        console.log('Created new profile:', freelancerProfile)
      }

      if (profileError) throw profileError

      if (freelancerProfile) {
        setProfile(prev => ({
          ...prev,
          fullName: freelancerProfile.full_name || '',
          title: freelancerProfile.professional_title || '',
          hourlyRate: freelancerProfile.hourly_rate?.toString() || '',
          skills: freelancerProfile.skills || [],
          avatar_url: freelancerProfile.avatar_url || '',
          phone: freelancerProfile.phone || '',
          location: freelancerProfile.location || '',
          website_url: freelancerProfile.website_url || '',
          socialLinks: {
            github: freelancerProfile.github || ''
          },
          experience: freelancerProfile.experience || [],
          education: freelancerProfile.education || [],
        }))
      }

      // Get user email from auth
      setProfile(prev => ({
        ...prev,
        email: user.email || ''
      }))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred loading profile')
    } finally {
      setLoading(false)
    }
  }

  const validateProfile = (): boolean => {
    if (!profile.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (profile.website_url && !profile.website_url.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return false;
    }
    
    if (profile.socialLinks.github && !profile.socialLinks.github.startsWith('http')) {
      setError('Please enter a valid GitHub URL starting with http:// or https://');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!validateProfile()) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updates = {
        full_name: profile.fullName,
        professional_title: profile.title || null,
        hourly_rate: profile.hourlyRate ? parseFloat(profile.hourlyRate) : null,
        skills: profile.skills || [],
        phone: profile.phone || null,
        location: profile.location || null,
        website_url: profile.website_url || null,
        github: profile.socialLinks.github || null,
        experience: profile.experience || [],
        education: profile.education || [],
        updated_at: new Date().toISOString()
      };

      console.log('Updating profile with:', updates);

      const { error } = await supabase
        .from('freelancer_profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setIsEditing(false);
      setError(null); // Clear any previous errors on successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred saving profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      
      if (!event.target.files || event.target.files.length === 0) {
        setError('No file selected');
        return;
      }
      
      const file = event.target.files[0];
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Reset the input value to allow re-uploading the same file
      event.target.value = '';
      setUploadingImage(true);

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicURL = data.publicUrl

      if (!publicURL) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      // Get freelancer profile ID
      const { data: freelancerProfile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (profileError) throw profileError
      if (!freelancerProfile) throw new Error('Freelancer profile not found')

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('freelancer_profiles')
        .update({ avatar_url: publicURL })
        .eq('id', freelancerProfile.id)

      if (updateError) throw updateError

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: publicURL }))
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Error uploading image')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00704A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="shrink-0 mr-2" size={20} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Profile Header with Image Upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Camera size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  <Camera size={16} className="text-gray-600" />
                </label>
              )}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="block w-full text-2xl font-bold border-gray-300 rounded-lg focus:border-[#00704A] focus:ring-[#00704A]"
                    placeholder="Your full name"
                  />
                  <input
                    type="text"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="block w-full text-lg text-gray-600 border-gray-300 rounded-lg focus:border-[#00704A] focus:ring-[#00704A]"
                    placeholder="Professional title"
                  />
                  <input
                    type="number"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                    className="block w-full text-lg text-gray-600 border-gray-300 rounded-lg focus:border-[#00704A] focus:ring-[#00704A]"
                    placeholder="Hourly rate ($)"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                  <p className="text-lg text-gray-600 mt-1">{profile.title}</p>
                  {profile.hourlyRate && (
                    <p className="text-lg text-gray-600 mt-1">${profile.hourlyRate}/hr</p>
                  )}
                </>
              )}

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail size={18} className="mr-2" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  {isEditing ? (
                    <>
                      <Phone size={18} className="mr-2" />
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        className="border rounded-lg px-2 py-1 w-full"
                        placeholder="Phone number"
                      />
                    </>
                  ) : (
                    <>
                      <Phone size={18} className="mr-2" />
                      <span>{profile.phone}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  {isEditing ? (
                    <>
                      <MapPin size={18} className="mr-2" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={e => setProfile({ ...profile, location: e.target.value })}
                        className="border rounded-lg px-2 py-1 w-full"
                        placeholder="Location"
                      />
                    </>
                  ) : (
                    <>
                      <MapPin size={18} className="mr-2" />
                      <span>{profile.location}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  {isEditing ? (
                    <>
                      <Globe size={18} className="mr-2" />
                      <input
                        type="text"
                        value={profile.website_url}
                        onChange={e => setProfile({ ...profile, website_url: e.target.value })}
                        className="border rounded-lg px-2 py-1 w-full"
                        placeholder="Portfolio/website_url URL"
                      />
                    </>
                  ) : (
                    <>
                      <Globe size={18} className="mr-2" />
                      <a href={profile.website_url} className="hover:text-[#00704A]">{profile.website_url}</a>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex space-x-4">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Github size={20} className="text-gray-600" />
                    <input
                      type="text"
                      value={profile.socialLinks.github}
                      onChange={e => setProfile({
                        ...profile,
                        socialLinks: { ...profile.socialLinks, github: e.target.value }
                      })}
                      className="border rounded-lg px-2 py-1 w-48"
                      placeholder="GitHub URL"
                    />
                  </div>
                ) : (
                  <a
                    href={profile.socialLinks.github}
                    className="text-gray-600 hover:text-[#00704A]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github size={20} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center ${
              isEditing
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-[#00704A] text-white hover:bg-[#005538]'
            } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isEditing ? (
              <>
                <X size={20} className="mr-2" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 size={20} className="mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
            >
              {skill}
              {isEditing && (
                <button
                  onClick={() => setProfile({
                    ...profile,
                    skills: profile.skills.filter((_, i) => i !== index)
                  })}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </span>
          ))}
          {isEditing && (
            <button
              onClick={() => {
                const skill = prompt('Enter new skill')
                if (skill && !profile.skills.includes(skill)) {
                  setProfile({
                    ...profile,
                    skills: [...profile.skills, skill]
                  })
                }
              }}
              className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-[#00704A] hover:text-[#00704A]"
            >
              <Plus size={14} className="inline mr-1" />
              Add Skill
            </button>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Experience</h3>
        <div className="space-y-6">
          {profile.experience.map((exp, idx) => (
            <div key={exp.id || idx} className="flex items-start">
              <div className="mr-4">
                <Briefcase size={20} className="text-gray-400" />
              </div>
              <div className="w-full">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" value={exp.role} onChange={e => {
                      const updated = [...profile.experience];
                      updated[idx].role = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }} className="border rounded-lg px-2 py-1" placeholder="Role" />
                    <input type="text" value={exp.company} onChange={e => {
                      const updated = [...profile.experience];
                      updated[idx].company = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }} className="border rounded-lg px-2 py-1" placeholder="Company" />
                    <input type="text" value={exp.duration} onChange={e => {
                      const updated = [...profile.experience];
                      updated[idx].duration = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }} className="border rounded-lg px-2 py-1" placeholder="Duration" />
                    <input type="text" value={exp.description} onChange={e => {
                      const updated = [...profile.experience];
                      updated[idx].description = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }} className="border rounded-lg px-2 py-1 col-span-2" placeholder="Description" />
                    <button onClick={() => {
                      setProfile({
                        ...profile,
                        experience: profile.experience.filter((_, i) => i !== idx)
                      });
                    }} className="text-red-500 col-span-2 text-left">Remove</button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium text-gray-900">{exp.role}</h4>
                    <p className="text-gray-600">{exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <p className="mt-2 text-gray-600">{exp.description}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <button
              className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-[#00704A] hover:text-[#00704A] mt-2"
              onClick={() => setProfile({
                ...profile,
                experience: [
                  ...profile.experience,
                  { id: Date.now(), role: '', company: '', duration: '', description: '' }
                ]
              })}
            >
              <Plus size={14} className="inline mr-1" /> Add Experience
            </button>
          )}
        </div>
      </div> 

      {/* Education */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
        <div className="space-y-6">
          {profile.education.map((edu, idx) => (
            <div key={edu.id || idx} className="flex items-start">
              <div className="mr-4">
                <GraduationCap size={20} className="text-gray-400" />
              </div>
              <div className="w-full">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" value={edu.degree} onChange={e => {
                      const updated = [...profile.education];
                      updated[idx].degree = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }} className="border rounded-lg px-2 py-1" placeholder="Degree" />
                    <input type="text" value={edu.institution} onChange={e => {
                      const updated = [...profile.education];
                      updated[idx].institution = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }} className="border rounded-lg px-2 py-1" placeholder="Institution" />
                    <input type="text" value={edu.year} onChange={e => {
                      const updated = [...profile.education];
                      updated[idx].year = e.target.value;
                      setProfile({ ...profile, education: updated });
                    }} className="border rounded-lg px-2 py-1 col-span-2" placeholder="Year" />
                    <button onClick={() => {
                      setProfile({
                        ...profile,
                        education: profile.education.filter((_, i) => i !== idx)
                      });
                    }} className="text-red-500 col-span-2 text-left">Remove</button>
                  </div>
                ) : (
                  <>
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.year}</p>
                  </>
                )}
              </div>
            </div>
          ))}
          {isEditing && (
            <button
              className="px-3 py-1 border-2 border-dashed border-gray-300 text-gray-600 rounded-full text-sm hover:border-[#00704A] hover:text-[#00704A] mt-2"
              onClick={() => setProfile({
                ...profile,
                education: [
                  ...profile.education,
                  { id: Date.now(), degree: '', institution: '', year: '' }
                ]
              })}
            >
              <Plus size={14} className="inline mr-1" /> Add Education
            </button>
          )}
        </div>
      </div> 

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-[#00704A] text-white rounded-lg hover:bg-[#005538] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} className="mr-2" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

export default Profile