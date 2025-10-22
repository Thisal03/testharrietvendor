import {Metadata} from 'next';
import {createMetadata} from './metadata.config';

export const HOME_METADATA: Metadata = createMetadata({
    title:
        'Welcome to Harriet Vendor Portal, your gateway to managing your online store. | Harriet Vendor Portal',
    description:
        'Welcome to Harriet Vendor Portal, your gateway to managing your online store. Access your dashboard to track orders, manage products, and connect with customers.',
    alternates: {
        canonical: '/'
    },
    robots: {
        index: false,
        follow: false
    }
});

export const PRODUCTS_METADATA: Metadata = createMetadata({
    title: 'Manage Your Products | Harriet Vendor Portal',
    description:
        'Manage your products efficiently with Harriet Vendor Portal. Add, edit, and track your inventory seamlessly. Join us to enhance your online store experience.',
    alternates: {
        canonical: '/dashboard/product'
    }
});

export const ORDERS_METADATA: Metadata = createMetadata({
    title: 'Track Your Orders | Harriet Vendor Portal',
    description:
        'Track your orders effortlessly with Harriet Vendor Portal. Manage customer orders, view order history, and ensure timely deliveries to enhance customer satisfaction.',
    alternates: {
        canonical: '/dashboard/order'
    }
});

export const OVERVIEW_METADATA: Metadata = createMetadata({
    title: 'Dashboard Overview | Harriet Vendor Portal',
    description:
        'Get a comprehensive overview of your store performance with Harriet Vendor Portal. Track sales, manage orders, and optimize your online business.',
    alternates: {
        canonical: '/dashboard/overview'
    }
});

export const AUTH_METADATA: Metadata = createMetadata({
    title: 'Sign in to your Vendor Portal | Harriet Vendor Portal',
    description:
        'Sign in to your Harriet Vendor Portal account to manage your online store. Access your dashboard, track orders, and connect with customers seamlessly.',
    alternates: {
        canonical: '/auth/sign-in'
    }
});
