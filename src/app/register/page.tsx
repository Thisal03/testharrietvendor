import { RegistrationViewPage } from '@/features/register/components/registration-view-page';
import React from 'react';

export const metadata = {
  title: 'Register a new account',
  description: 'Fill in the details to create a new account.'
};

const RegistrationPage = () => {
  return <RegistrationViewPage />;
};

export default RegistrationPage;
