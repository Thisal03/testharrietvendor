import React from 'react';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Harriet Vendor Portal.'
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using the Harriet Vendor Portal, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials on Harriet Vendor Portal for personal, non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Harriet Vendor Portal are provided on an &apos;as is&apos; basis. Harriet makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall Harriet or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Harriet Vendor Portal, even if Harriet or a Harriet authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2>5. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us.
        </p>
      </div>
    </div>
  );
}
