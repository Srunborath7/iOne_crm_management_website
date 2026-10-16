import SessionHydrator from '@/src/components/SessionHydrator';
import { ToastProvider } from '@/src/components/ui/ToastProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <SessionHydrator />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
