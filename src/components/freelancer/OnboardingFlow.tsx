import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface OnboardingFlowProps {
  userId: string;
  onComplete: () => void;
}

const initialData = {
  name: '',
  location: '',
  phone: '',
  dob: '',
  governmentIdFile: null as File | null,
  resumeFile: null as File | null,
  linkedin: '',
  github: '',
  instagram: '',
  questionnaire: [] as { question: string; answer: string }[],
};

const questions = [
  'Why do you want to join?',
  'What is your main skill?',
  'How many years of experience do you have?',
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utility for uploading a file to Supabase Storage
  const uploadFile = async (bucket: string, file: File) => {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${userId}/${file.name}`, file, { upsert: true });
    if (error) throw error;
    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(`${userId}/${file.name}`);
    return urlData.publicUrl;
  };

  const handleNext = async () => {
    setError(null);
    setLoading(true);
    try {
      if (step === 1) {
        // Save personal details
        const { error } = await supabase
          .from('freelancer_profiles')
          .update({
            full_name: data.name,
            location: data.location,
            phone: data.phone,
            dob: data.dob,
          })
          .eq('user_id', userId);
        if (error) throw error;
        setStep(2);
      } else if (step === 2) {
        // Upload files and save URLs
        let governmentIdUrl = '';
        let resumeUrl = '';
        if (data.governmentIdFile) {
          governmentIdUrl = await uploadFile('government-ids', data.governmentIdFile);
        }
        if (data.resumeFile) {
          resumeUrl = await uploadFile('resumes', data.resumeFile);
        }
        const { error } = await supabase
          .from('freelancer_profiles')
          .update({
            government_id_url: governmentIdUrl,
            resume_url: resumeUrl,
            linkedin_url: data.linkedin,
            github_url: data.github,
            instagram_url: data.instagram,
          })
          .eq('user_id', userId);
        if (error) throw error;
        setStep(3);
      } else if (step === 3) {
        // Save questionnaire answers
        const { error } = await supabase
          .from('freelancer_profiles')
          .update({
            questionnaire: data.questionnaire,
            is_verified: false,
          })
          .eq('user_id', userId);
        if (error) throw error;
        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Render each step
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      {step === 1 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Personal Details</h2>
          <input className="input" placeholder="Name" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
          <input className="input" placeholder="Location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
          <input className="input" placeholder="Phone" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
          <input className="input" type="date" placeholder="DOB" value={data.dob} onChange={e => setData({ ...data, dob: e.target.value })} />
          <button className="btn mt-4" onClick={handleNext} disabled={loading}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Document Upload</h2>
          <label>Government ID:
            <input type="file" accept="image/*,application/pdf" onChange={e => setData({ ...data, governmentIdFile: e.target.files?.[0] || null })} />
          </label>
          <label>Resume:
            <input type="file" accept="application/pdf,application/msword" onChange={e => setData({ ...data, resumeFile: e.target.files?.[0] || null })} />
          </label>
          <input className="input" placeholder="LinkedIn URL" value={data.linkedin} onChange={e => setData({ ...data, linkedin: e.target.value })} />
          <input className="input" placeholder="GitHub URL" value={data.github} onChange={e => setData({ ...data, github: e.target.value })} />
          <input className="input" placeholder="Instagram URL (optional)" value={data.instagram} onChange={e => setData({ ...data, instagram: e.target.value })} />
          <button className="btn mt-4" onClick={handleNext} disabled={loading}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Questionnaire</h2>
          {questions.map((q, idx) => (
            <div key={q} className="mb-2">
              <label>{q}</label>
              <input className="input" value={data.questionnaire[idx]?.answer || ''} onChange={e => {
                const updated = [...data.questionnaire];
                updated[idx] = { question: q, answer: e.target.value };
                setData({ ...data, questionnaire: updated });
              }} />
            </div>
          ))}
          <button className="btn mt-4" onClick={handleNext} disabled={loading}>Next</button>
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Verification Pending</h2>
          <p>Your application is under review. You will be notified when your account is approved.</p>
        </div>
      )}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default OnboardingFlow;
