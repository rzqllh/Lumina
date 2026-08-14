import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
