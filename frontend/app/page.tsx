'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(false);
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/signin');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Super-Budget..." />
      </div>
    );
  }

  return null;
}
