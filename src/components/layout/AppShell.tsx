import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 mb-16 md:mb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
