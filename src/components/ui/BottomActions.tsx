import type { ReactNode } from 'react';

interface BottomActionsProps {
  children: ReactNode;
}

export function BottomActions({ children }: BottomActionsProps) {
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {children}
    </footer>
  );
}
