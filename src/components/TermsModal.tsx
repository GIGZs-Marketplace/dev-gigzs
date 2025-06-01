import React, { useState } from 'react';
import {
  Modal,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Paper
} from '@mui/material';

const TermsModal: React.FC<{ open: boolean; onClose: () => void; onAccept: () => void }> = ({ open, onClose, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  const termsContent = `Welcome to Gigzs, a freelancing marketplace platform built on trust, transparency, and niche-specific collaboration. These Terms and Conditions ("Terms") govern your access and use of the platform, services, and tools provided by Gigzs ("we", "our", or "us"). By accessing or using Gigzs, you agree to these Terms.

1. Eligibility
You must be at least 18 years old and legally able to form a binding contract.

You agree to provide accurate, truthful information during signup and verification.

2. User Types
Freelancers: Individuals or teams offering professional services.

Clients: Individuals or businesses hiring freelancers for projects.

3. Account Responsibilities
You are responsible for maintaining the confidentiality of your account.

You may not impersonate another user or use false information.

4. Verification & Screening
Gigzs reserves the right to verify user identities using KYC, background checks, or psychological screening.

Freelancers undergo skill and mental compatibility tests as part of onboarding.

5. Gig Creation & Projects
Clients may post projects and invite freelancers.

Freelancers may propose services via predefined "Gig Packs."

All work agreements must be structured through Gigzs contracts and must not bypass the platform.

6. Vault Submission System
Freelancers submit completed work into the Vault System.

Clients preview work and release payment only upon satisfaction.

This system ensures protection for both parties.

7. Payments & Fees
Payments are made securely through approved gateways (e.g., Cashfree, [future Gigzs Payments]).

Gigzs charges a platform fee on successful transactions (percentage defined at onboarding).

Withdrawal timelines and fees may vary based on region.

8. Prohibited Activities
You may not:

Bypass Gigzs to avoid fees.

Use AI to generate fraudulent or low-effort work.

Engage in harassment, spamming, or abusive behavior.

Submit fake projects, reviews, or documentation.

9. Dispute Resolution
Disputes between clients and freelancers should first be resolved through our internal Dispute Resolution Team.

Both parties must provide all necessary communication, contract agreements, and work proofs.

Gigzs reserves final authority to mediate and decide dispute outcomes.

10. Termination & Suspension
We may suspend or terminate accounts for violating terms or engaging in harmful behavior.

Users may request account closure at any time.

11. Intellectual Property
Users retain ownership of their work unless otherwise agreed in writing.

Clients gain rights to work only after payment is fully processed.

12. Limitation of Liability
Gigzs is not liable for:

Any direct or indirect losses resulting from disputes, missed deadlines, or platform downtime.

Any third-party interactions outside the platform.

13. Changes to Terms
We may update these Terms from time to time. Continued use of Gigzs after changes means you accept the updated Terms.

14. Contact Us
For support or questions about these Terms, email us at: info@gigzs.in`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="terms-modal-title"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          maxWidth: 800,
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          p: 4,
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="h4" component="h1" id="terms-modal-title" gutterBottom>
          Terms and Conditions
        </Typography>
        
        <Box
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            pr: 1,
            mb: 3
          }}
        >
          {termsContent.split('\n\n').map((section, index) => (
            <Typography key={index} paragraph>
              {section}
            </Typography>
          ))}
        </Box>
        
        <FormControlLabel
          control={
            <Checkbox 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              name="agreeTerms" 
            />
          }
          label="I have read and agree to the Terms and Conditions"
          sx={{ mt: 2 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (agreed) {
                onAccept();
                onClose();
              }
            }}
            disabled={!agreed}
            sx={{ 
              bgcolor: 'var(--primary-color, #00704a)',
              color: 'var(--primary-text, #ffffff)',
              '&:hover': {
                bgcolor: 'var(--primary-color-dark, #005c3d)'
              }
            }}
          >
            Accept
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default TermsModal;
