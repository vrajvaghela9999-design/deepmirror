import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'de', 'hi'],

  // Used when no locale matches
  defaultLocale: 'en'
});

export const config = {
  // Match ALL paths except for api, _next files, and images
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};