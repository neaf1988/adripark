import type { ReactNode } from 'react';
import { BottomActions } from './ui/BottomActions';
import { Button } from './ui/Button';

interface LayoutProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Layout({ title, subtitle, onBack, children, footer }: LayoutProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50">
      <header className="shrink-0 bg-primary px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white shadow-md">
        {onBack && (
          <Button variant="ghost" className="mb-2 !h-10 !px-2 !text-sm !text-blue-100" onClick={onBack}>
            ← Volver
          </Button>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-blue-100">{subtitle}</p>}
      </header>
      <main className="flex-1 overflow-y-auto overscroll-contain p-4">{children}</main>
      {footer && <BottomActions>{footer}</BottomActions>}
    </div>
  );
}
