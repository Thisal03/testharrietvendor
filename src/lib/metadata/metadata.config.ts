import { Metadata } from 'next';

export const SITE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://seller.harrietshopping.com';
export const DEFAULT_IMAGE =
  'https://images.harrietshopping.com/front-web/images/cover/og-image-01.png';
export const DEFAULT_IMAGE_ALT =
  'Harriet Vendor Portal - Online Fashion Marketplace in Sri Lanka';
export const SITE_NAME = 'Harriet Vendor Portal';

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  keywords: ['online shopping', 'Sri Lanka', 'fashion', 'clothing', 'Harriet'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: false,
    follow: false
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  },
  icons: {
    icon: '/favicon.ico'
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_IMAGE,
        width: 1200,
        height: 630,
        alt: DEFAULT_IMAGE_ALT
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_IMAGE]
  }
};

export const createMetadata = (metadata: Metadata): Metadata => {
  return {
    ...DEFAULT_METADATA,
    ...metadata,
    openGraph: {
      ...DEFAULT_METADATA.openGraph,
      ...metadata.openGraph,
      images: metadata.openGraph?.images || DEFAULT_METADATA.openGraph?.images
    },
    twitter: {
      ...DEFAULT_METADATA.twitter,
      ...metadata.twitter,
      images: metadata.twitter?.images || DEFAULT_METADATA.twitter?.images
    }
  };
};
