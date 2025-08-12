'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('shannon.anahata@gmail.com');
  const [status, setStatus] = useState('');

  const testEmail = async () => {
    setStatus('Sending...');
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('Email sent successfully! Check your inbox.');
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Email Functionality
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Resend free tier only allows emails to your verified address
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <p className="mt-1 text-xs text-gray-500">
              Use shannon.anahata@gmail.com for testing
            </p>
          </div>
          <button
            onClick={testEmail}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Send Test Email
          </button>
          {status && (
            <div className={`mt-4 p-4 rounded-md ${
              status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {status}
            </div>
          )}
          <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
            <h3 className="font-medium">Next Steps:</h3>
            <ul className="mt-2 text-sm space-y-1">
              <li>• Try signing in with shannon.anahata@gmail.com</li>
              <li>• Check your email for the magic link</li>
              <li>• To use other emails, verify a domain in Resend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
