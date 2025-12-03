import createNextIntlPlugin from 'next-intl/plugin';

// HERE IS THE FIX: We point explicitly to your ./i18n.ts file
const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);