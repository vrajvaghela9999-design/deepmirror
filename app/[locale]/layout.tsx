import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from "next/font/google";
import "../globals.css"; // Imports the global styles

// Import the new button we created
// If this line gives an error, change it to: import LanguageSwitcher from "../../../components/LanguageSwitcher";
import LanguageSwitcher from "@/components/LanguageSwitcher"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DeepMirror",
  description: "Your Personal AI Reflection Companion",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // 1. Wait for the locale (Required for Next.js 15/16)
  const { locale } = await params;
  
  // 2. Load the translations for this language
  const messages = await getMessages();

  return (
    // 3. Add suppressHydrationWarning to stop the console errors
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          
          {/* 4. The Language Button sits here, floating above everything else */}
          <LanguageSwitcher />
          
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}