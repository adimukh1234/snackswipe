'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-gray-50">
      {/* Header */}
      <header className="flex items-center px-5 py-4 safe-top">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-icon"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        </Link>
      </header>

      {/* Clerk Sign Up */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <SignUp 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent',
                headerTitle: 'text-2xl font-bold text-gray-900',
                headerSubtitle: 'text-gray-500',
                socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50',
                formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                formFieldInput: 'border-2 border-gray-200 focus:border-purple-500 rounded-xl',
                footerActionLink: 'text-purple-600 hover:text-purple-700',
              },
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
