'use client';
import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users } from 'lucide-react';
import HarrietLogo from './harriet-logo';

const AuthBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className='relative hidden h-full w-full p-2 lg:block'
    >
      <div className='relative hidden h-full flex-col overflow-hidden rounded-3xl p-10 text-white lg:flex'>
        <div className='absolute inset-0 rounded-3xl bg-[url(/assets/auth-bg.webp)] bg-cover' />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='relative z-10'
        >
          <HarrietLogo isDark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className='relative z-10 mt-auto space-y-6'
        >
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <div className='rounded-full bg-white/20 p-2 backdrop-blur-sm'>
                <TrendingUp className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Grow Your Business</h3>
                <p className='text-sm text-white/80'>
                  Reach thousands of customers and scale your sales
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='rounded-full bg-white/20 p-2 backdrop-blur-sm'>
                <Users className='h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Join Our Community</h3>
                <p className='text-sm text-white/80'>
                  Connect with style-savvy retailers and trendsetters
                </p>
              </div>
            </div>
          </div>

          <blockquote className='space-y-2 border-l-4 border-white/30 pl-4'>
            <p className='text-lg leading-relaxed'>
              &quot;Become an online seller on Harriet in just a few simple
              steps - join a community of style savvy retailers, trendsetters
              and couture lovers.&quot;
            </p>
            <footer className='text-sm text-white/70'>— Harriet Team</footer>
          </blockquote>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthBanner;
