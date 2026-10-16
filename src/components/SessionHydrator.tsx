// components/SessionHydrator.tsx
'use client';
import { useEffect } from 'react';
import { restoreSession } from '@/src/lib/session';

export default function SessionHydrator() {
  useEffect(() => {
    restoreSession();
  }, []);
  return null;
}