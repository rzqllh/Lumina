import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div
      className="min-h-[100dvh] flex flex-col text-foreground"
      style={{ backgroundColor: 'var(--color-canvas-bg)' }}
    >
      <Header />
      <main
        className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8"
        style={{
          paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
