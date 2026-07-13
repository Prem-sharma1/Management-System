'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardGate() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (!res.ok || !data.user) {
          router.push('/');
          return;
        }

        const role = data.user.role;
        if (role === 'CEO') {
          router.push('/dashboard/ceo');
        } else if (role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (role === 'EMPLOYEE') {
          router.push('/dashboard/employee');
        } else if (role === 'TL') {
          router.push('/dashboard/tl');
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error(err);
        router.push('/');
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm">Redirecting to your workspace...</p>
      </div>
    </div>
  );
}
