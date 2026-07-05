import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

export function AppShell({ children, title, breadcrumb }) {
  const { T } = useTheme();
  const resp = useResponsive();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: T.bg1 }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <Topbar title={title} breadcrumb={breadcrumb} />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: resp.isMobile ? '16px' : '24px',
        }}>
          <div className="page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}