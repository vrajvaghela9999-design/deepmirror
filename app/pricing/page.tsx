'use client';

import { supabase } from '@/lib/supabaseClient'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please login to subscribe.");
        setLoading(false);
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          email: user.email 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert("Server Error: " + errorText);
        setLoading(false);
        return;
      }

      // FIX: Get the URL and redirect manually
      const { url } = await res.json();
      
      if (url) {
        window.location.href = url;
      } else {
        alert("Error: No checkout URL returned");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DeepMirror Premium</h1>
        <p className="text-gray-500 mb-6">Invest in your personal growth.</p>
        
        <div className="mb-8">
          <span className="text-6xl font-extrabold text-indigo-600">$15</span>
          <span className="text-xl text-gray-400 font-medium">/month</span>
        </div>

        <ul className="space-y-4 mb-8 text-left">
          <li className="flex items-center text-gray-700">
            <span className="mr-3 text-green-500 font-bold">✓</span> Unlimited Chat Sessions
          </li>
          <li className="flex items-center text-gray-700">
            <span className="mr-3 text-green-500 font-bold">✓</span> Advanced Analytics
          </li>
          <li className="flex items-center text-gray-700">
            <span className="mr-3 text-green-500 font-bold">✓</span> Priority Support
          </li>
        </ul>

        <button 
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Redirecting...' : 'Upgrade Now'}
        </button>
        
        <button 
          onClick={() => router.back()}
          className="mt-4 text-gray-400 hover:text-gray-600 text-sm"
        >
          Back
        </button>

      </div>
    </div>
  );
}