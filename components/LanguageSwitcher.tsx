'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      // This replaces the current URL with the new language URL
      // Example: /en/chat -> /de/chat
      router.replace(`/${nextLocale}`);
    });
  };

  return (
    <div className="absolute top-5 right-5 z-50">
      <label className="sr-only">Choose language</label>
      <select
        defaultValue={localActive}
        className="bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={onSelectChange}
        disabled={isPending}
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="hi">हिंदी (Hindi)</option>
      </select>
    </div>
  );
}