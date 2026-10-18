"use client";

import React from 'react';
import AppWorkspace from '@/components/AppWorkspace';
import { useRouter } from 'next/navigation';

export default function WorkspaceDirectPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AppWorkspace onLogout={() => router.push('/')} />
    </div>
  );
}
