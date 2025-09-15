import React from 'react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Harriet Vendor Portal.'
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
        </p>

        <h2>3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2>5. Cookies</h2>
        <p>
          We use cookies and similar technologies to enhance your experience on our platform and to analyze how our services are used.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  );
}
