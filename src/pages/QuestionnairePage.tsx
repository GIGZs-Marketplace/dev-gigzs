import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; // Adjust path if necessary
import TermsModal from '../components/TermsModal';

// Define a type for the answers
interface QuestionnairePageProps {
  userId?: string;
  onComplete: () => Promise<void> | void;
}

interface QuestionnaireAnswers {
  aiAutomation: string;
  vagueInstructions: string;
  creativeFreedomGig: string;
  didntQuitStory: string;
  loseTrackOfTimeWork: string;
  importantTruthChange: string;
}

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ userId, onComplete }) => {
  const [answers, setAnswers] = useState<Partial<QuestionnaireAnswers>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatusMessage, setSubmitStatusMessage] = useState<string | null>(null);
  const [submitStatusType, setSubmitStatusType] = useState<'success' | 'error' | null>(null);
  const [showTerms, setShowTerms] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Load answers from localStorage on mount or when userId changes
  useEffect(() => {
    if (userId) {
      const savedAnswersRaw = localStorage.getItem(`questionnaireAnswers-${userId}`);
      if (savedAnswersRaw) {
        try {
          const savedAnswersParsed = JSON.parse(savedAnswersRaw);
          setAnswers(savedAnswersParsed);
        } catch (error) {
          console.error("Failed to parse saved answers from localStorage", error);
          localStorage.removeItem(`questionnaireAnswers-${userId}`); // Clear corrupted data
        }
      }
    }
  }, [userId]);

  // Save answers to localStorage whenever they change and userId is available
  useEffect(() => {
    if (userId && Object.keys(answers).length > 0) {
      localStorage.setItem(`questionnaireAnswers-${userId}`, JSON.stringify(answers));
    }
  }, [answers, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAnswers(prev => ({ ...prev, [name]: value }));
    setSubmitStatusMessage(null); // Clear submission status on new input
    setSubmitStatusType(null);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!answers.aiAutomation) newErrors.aiAutomation = 'Please select an answer.';
    if (!answers.vagueInstructions) newErrors.vagueInstructions = 'Please select an answer.';
    if (!answers.creativeFreedomGig) newErrors.creativeFreedomGig = 'Please select an answer.';
    if (!answers.didntQuitStory) newErrors.didntQuitStory = 'Please answer this question.';
    if (answers.didntQuitStory && answers.didntQuitStory.split(/\s+/).length > 100) {
      newErrors.didntQuitStory = 'Answer must be 100 words max.';
    }
    if (!answers.loseTrackOfTimeWork) newErrors.loseTrackOfTimeWork = 'Please answer this question.';
    if (answers.loseTrackOfTimeWork && answers.loseTrackOfTimeWork.split(/\s+/).length > 100) {
      newErrors.loseTrackOfTimeWork = 'Answer must be 100 words max.';
    }
    if (!answers.importantTruthChange) newErrors.importantTruthChange = 'Please answer this question.';
    if (answers.importantTruthChange && answers.importantTruthChange.split(/\s+/).length > 100) {
      newErrors.importantTruthChange = 'Answer must be 100 words max.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTermsAccept = () => {
    setTermsAccepted(true);
    setShowTerms(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrors({}); // Clear previous errors
    console.log('Attempting to submit answers:', answers, 'for auth_user_id:', userId);

    if (!userId) {
      setErrors({ submit: 'User not authenticated. Cannot submit questionnaire.' });
      setSubmitStatusMessage('Error: User not authenticated.');
      setSubmitStatusType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Get the freelancer_profile_id based on the authUserId (userId prop)
      // Assuming your freelancer_profiles table has a 'user_id' column that matches auth.users.id
      // and 'id' is the primary key of freelancer_profiles.
      const { data: profileData, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id') // Select the primary key of the freelancer_profiles table
        .eq('user_id', userId) // Filter by the user_id from auth.users
        .single();

      if (profileError) {
        console.error('Error fetching freelancer profile:', profileError);
        throw new Error('Failed to fetch your profile information. Please try again.');
      }

      if (!profileData) {
        console.error(`No freelancer profile found for authUserId: ${userId}`);
        throw new Error('Your freelancer profile was not found. Please complete previous steps.');
      }

      const freelancerProfileId = profileData.id;
      console.log(`Found freelancer_profile_id: ${freelancerProfileId}`);

      // 2. Prepare data for upsert into freelancer_questionnaire_responses
      const responseData = {
        profile_id: freelancerProfileId, // This is the PK from freelancer_profiles
        ai_automation_response: answers.aiAutomation,
        vague_instructions_response: answers.vagueInstructions,
        creative_freedom_gig_response: answers.creativeFreedomGig,
        didnt_quit_story: answers.didntQuitStory,
        lose_track_of_time_work: answers.loseTrackOfTimeWork,
        important_truth_change: answers.importantTruthChange,
        // updated_at will be handled by the database trigger or default value if set up
        // created_at will be handled by its default value if set up
      };

      // 3. Upsert into freelancer_questionnaire_responses
      // Upsert based on profile_id to ensure one set of responses per profile
      const { data: upsertData, error: upsertError } = await supabase
        .from('freelancer_questionnaire_responses')
        .upsert(responseData, { onConflict: 'profile_id' })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting questionnaire responses:', upsertError);
        throw new Error('Failed to save your questionnaire responses. Please try again.');
      }

      console.log('Questionnaire responses saved successfully:', upsertData);
      setSubmitStatusMessage('Questionnaire submitted successfully! Proceeding to the next step.');
      setSubmitStatusType('success');
      // Clear form or redirect as needed, onComplete will handle next step
      // For now, let's keep the onComplete call. If it navigates away, the message might be brief.
      // If onComplete doesn't navigate immediately, the message will be visible.
      onComplete(); // Signal to FreelancerOnboarding to move to the next step
      if (userId) {
        localStorage.removeItem(`questionnaireAnswers-${userId}`);
      }

    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      setErrors({ submit: errorMessage });
      setSubmitStatusMessage(`Error: ${errorMessage}`);
      setSubmitStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWordCount = (text: string | undefined) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const styles = {
    pageContainer: {
      fontFamily: 'Onest, sans-serif', // Default font for text
      backgroundColor: '#f7f7f7',
      color: '#272727',
      padding: '40px',
      maxWidth: '800px',
      margin: '40px auto',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    mainHeading: {
      fontFamily: 'Impact, sans-serif', // As per memory
      color: '#00704a', // Primary green
      textAlign: 'center' as 'center',
      marginBottom: '30px',
    },
    h1Style: {
        fontFamily: 'Boldonse, sans-serif', // As per memory
        fontSize: '2.5rem',
        marginBottom: '10px',
    },
    h2Style: {
        fontFamily: 'Onest, sans-serif', // As per memory
        fontSize: '1.8rem',
        color: '#00704a',
        marginTop: '30px',
        marginBottom: '15px',
    },
    statusMessageBase: {
      padding: '10px',
      margin: '10px 0',
      borderRadius: '4px',
      textAlign: 'center' as 'center',
    },
    successMessage: {
      backgroundColor: '#d4edda', // Light green for success
      color: '#155724', // Dark green text
      border: '1px solid #c3e6cb',
    },
    errorMessageText: { // Renamed to avoid conflict with existing errorText for validation
      backgroundColor: '#f8d7da', // Light red for error
      color: '#721c24', // Dark red text
      border: '1px solid #f5c6cb',
    },
    errorText: { // Existing style for validation errors
      color: 'red',
      fontSize: '0.9em',
      marginTop: '5px',
    },
    h3Style: {
        fontFamily: 'Rubik, sans-serif', // As per memory
        fontSize: '1.3rem',
        marginBottom: '10px',
    },
    paragraph: {
      lineHeight: '1.6',
      marginBottom: '15px',
    },
    importantNotes: {
      borderLeft: '4px solid #00704a',
      paddingLeft: '15px',
      margin: '20px 0',
      backgroundColor: '#e6f0ec',
    },
    questionBlock: {
      marginBottom: '30px',
    },
    label: {
      display: 'block',
      fontWeight: 'bold' as 'bold',
      marginBottom: '8px',
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column' as 'column',
    },
    radioLabel: {
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
    },
    radioInput: {
      marginRight: '10px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      minHeight: '100px',
      fontFamily: 'Onest, sans-serif',
      fontSize: '1rem',
      boxSizing: 'border-box' as 'border-box',
    },
    wordCount: {
      fontSize: '0.8rem',
      color: '#555',
      textAlign: 'right' as 'right',
    },
    submitButton: {
      backgroundColor: '#00704a', // Primary green
      color: 'white',
      padding: '12px 25px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '1.1rem',
      fontFamily: 'Rubik, sans-serif',
      display: 'block',
      margin: '30px auto 0 auto',
    },
    
  };

  return (
    <div style={styles.pageContainer}>
      <h1 style={{...styles.mainHeading, ...styles.h1Style}}>Freelancer Ethos Assessment</h1>
      
      <p style={styles.paragraph}>
        At Gigzs, we are building more than just a freelancing platform — we're building a high-trust ecosystem where dedicated, reliable, and emotionally mature freelancers can thrive.
      </p>
      <p style={styles.paragraph}>
        This assessment is not just about your technical skills. It’s about understanding how you think, how you handle pressure, how you grow, and how you respond to the realities of freelancing.
      </p>
      <p style={styles.paragraph}>
        We’re looking for:
      </p>
      <ul>
        <li>Freelancers who take ownership, not shortcuts</li>
        <li>Individuals who can bounce back from rejection and stay composed under pressure</li>
        <li>People who communicate with respect, clarity, and self-awareness</li>
        <li>Professionals who treat every client interaction with purpose and maturity</li>
      </ul>

      <div style={styles.importantNotes}>
        <h2 style={{...styles.h2Style, marginTop: '10px'}}>⚠️ Important Guidelines:</h2>
        <ul>
          <li>❌ No AI-generated or copy-paste answers allowed — we value honesty over perfection.</li>
          <li>✅ Every answer is read with empathy, not judgment. Be yourself.</li>
          <li>✍️ Short answers must reflect your true mindset, not what you think we want to hear.</li>
        </ul>
        <p style={styles.paragraph}>This test is not scored by right or wrong answers — it helps us understand if you're the right fit for high-value, long-term gigs on Gigzs.</p>
      </div>
      <TermsModal
        open={showTerms}
        onClose={() => setShowTerms(false)}
        onAccept={handleTermsAccept}
      />
      <form onSubmit={handleSubmit}>
        <h2 style={styles.h2Style}>Multiple Choice Questions</h2>

        {/* Question 1 */}
        <div style={styles.questionBlock}>
          <label style={styles.label}>1. If AI starts automating 50% of your freelance tasks, what will you do?</label>
          <div style={styles.radioGroup}>
            {['Learn to use AI to become faster and better', 'Shift to more human-centric gigs (e.g., strategy, sales)', 'Diversify my skills into new domains', 'Stick to my core – automation doesn’t scare me'].map((option, index) => (
              <label key={index} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="aiAutomation" 
                  value={String.fromCharCode(65 + index)} // A, B, C, D
                  checked={answers.aiAutomation === String.fromCharCode(65 + index)}
                  onChange={handleChange} 
                  style={styles.radioInput}
                /> {option}
              </label>
            ))}
          </div>
          {errors.aiAutomation && <p style={styles.errorText}>{errors.aiAutomation}</p>}
        </div>

        {/* Question 2 */}
        <div style={styles.questionBlock}>
          <label style={styles.label}>2. A client is very kind but gives vague or confusing instructions. What’s your best course of action?</label>
          <div style={styles.radioGroup}>
            {['Gently ask clarifying questions with examples', 'Try to interpret their intent and overdeliver', 'Set boundaries early with structure and expectations', 'Ask for a quick call or Loom video for clarity'].map((option, index) => (
              <label key={index} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="vagueInstructions" 
                  value={String.fromCharCode(65 + index)}
                  checked={answers.vagueInstructions === String.fromCharCode(65 + index)}
                  onChange={handleChange} 
                  style={styles.radioInput}
                /> {option}
              </label>
            ))}
          </div>
          {errors.vagueInstructions && <p style={styles.errorText}>{errors.vagueInstructions}</p>}
        </div>

        {/* Question 3 */}
        <div style={styles.questionBlock}>
          <label style={styles.label}>3. You're offered a gig that pays less than expected but offers creative freedom. What do you choose?</label>
          <div style={styles.radioGroup}>
            {['Take it — freedom matters more than money right now', 'Decline — I only take gigs that match my value', 'Take it — if I like the client and vision', 'Negotiate — and see if we can align both price and freedom'].map((option, index) => (
              <label key={index} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="creativeFreedomGig" 
                  value={String.fromCharCode(65 + index)}
                  checked={answers.creativeFreedomGig === String.fromCharCode(65 + index)}
                  onChange={handleChange} 
                  style={styles.radioInput}
                /> {option}
              </label>
            ))}
          </div>
          {errors.creativeFreedomGig && <p style={styles.errorText}>{errors.creativeFreedomGig}</p>}
        </div>

        <h2 style={styles.h2Style}>Short Answer Questions</h2>
        <p style={styles.paragraph}>(Answer given questions in 100 words max)</p>

        {/* Short Answer 1 */}
        <div style={styles.questionBlock}>
          <label htmlFor="didntQuitStory" style={styles.label}>Describe a time you wanted to quit something but didn’t. What kept you going?</label>
          <textarea 
            id="didntQuitStory" 
            name="didntQuitStory" 
            value={answers.didntQuitStory || ''} 
            onChange={handleChange} 
            style={styles.textarea}
            maxLength={700} // Approx 100 words, can be tuned
          />
          <p style={styles.wordCount}>{getWordCount(answers.didntQuitStory)} / 100 words</p>
          {errors.didntQuitStory && <p style={styles.errorText}>{errors.didntQuitStory}</p>}
        </div>

        {/* Short Answer 2 */}
        <div style={styles.questionBlock}>
          <label htmlFor="loseTrackOfTimeWork" style={styles.label}>What kind of work makes you lose track of time? Why do you think that happens?</label>
          <textarea 
            id="loseTrackOfTimeWork" 
            name="loseTrackOfTimeWork" 
            value={answers.loseTrackOfTimeWork || ''} 
            onChange={handleChange} 
            style={styles.textarea}
            maxLength={700}
          />
          <p style={styles.wordCount}>{getWordCount(answers.loseTrackOfTimeWork)} / 100 words</p>
          {errors.loseTrackOfTimeWork && <p style={styles.errorText}>{errors.loseTrackOfTimeWork}</p>}
        </div>

        {/* Short Answer 3 */}
        <div style={styles.questionBlock}>
          <label htmlFor="importantTruthChange" style={styles.label}>What is the most important truth you believe today where you used to believe the opposite? And why?</label>
          <textarea 
            id="importantTruthChange" 
            name="importantTruthChange" 
            value={answers.importantTruthChange || ''} 
            onChange={handleChange} 
            style={styles.textarea}
            maxLength={700}
          />
          <p style={styles.wordCount}>{getWordCount(answers.importantTruthChange)} / 100 words</p>
          {errors.importantTruthChange && <p style={styles.errorText}>{errors.importantTruthChange}</p>}
        </div>

        {submitStatusMessage && (
          <p style={{
            ...styles.statusMessageBase,
            ...(submitStatusType === 'success' ? styles.successMessage : {}),
            ...(submitStatusType === 'error' ? styles.errorMessageText : {}),
          }}>
            {submitStatusMessage}
          </p>
        )}
        <button type="submit" style={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Answers & Proceed to Verification'}
        </button>
        {errors.submit && <p style={{...styles.errorText, textAlign: 'center', marginTop: '10px'}}>{errors.submit}</p>}
      </form>
    </div>
  );
};

export default QuestionnairePage;
