// src/components/layout/AppShell.jsx
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { useTheme } from '@/hooks/useTheme';

export function AppShell({ children, title, breadcrumb }) {
  const { T } = useTheme();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg1 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar title={title} breadcrumb={breadcrumb} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}