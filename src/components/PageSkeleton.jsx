import { Skeleton } from '@/components/ui/Badge';
import useResponsive from '@/hooks/useResponsive';

export default function PageSkeleton({ type = 'dashboard', rows = 3 }) {
  const resp = useResponsive();
  const isMobile = resp.isMobile;

  const layouts = {
    dashboard: () => (
      <>
        <Skeleton width="180px" height={24} radius={8} style={{ marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[280, 240, 260, 300].map((w, i) => <Skeleton key={i} height={100} radius={12} />)}
        </div>
        <Skeleton height={40} radius={10} style={{ marginBottom: 16 }} />
        <Skeleton height={40} radius={10} style={{ marginBottom: 16 }} />
        <Skeleton height={40} radius={10} />
      </>
    ),
    list: () => (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Skeleton width="160px" height={24} radius={8} />
          <Skeleton width="120px" height={36} radius={8} />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <Skeleton width={40} height={40} radius={10} />
            <div style={{ flex: 1 }}><Skeleton height={14} radius={6} style={{ marginBottom: 6 }} /><Skeleton width="60%" height={12} radius={6} /></div>
            <Skeleton width={80} height={28} radius={8} />
          </div>
        ))}
      </>
    ),
    grid: () => (
      <>
        <Skeleton width="160px" height={24} radius={8} style={{ marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ padding: 20 }}>
              <Skeleton width={48} height={48} radius={12} style={{ marginBottom: 12 }} />
              <Skeleton height={16} radius={6} style={{ marginBottom: 8 }} />
              <Skeleton height={12} radius={6} style={{ marginBottom: 4 }} />
              <Skeleton width="60%" height={12} radius={6} />
            </div>
          ))}
        </div>
      </>
    ),
    profile: () => (
      <div style={{ display: 'flex', gap: 24, flexDirection: isMobile ? 'column' : 'row' }}>
        <div style={{ width: isMobile ? '100%' : 280 }}>
          <Skeleton height={200} radius={14} style={{ marginBottom: 16 }} />
          <Skeleton height={40} radius={10} />
        </div>
        <div style={{ flex: 1 }}>
          <Skeleton height={24} radius={8} style={{ marginBottom: 16 }} />
          <Skeleton height={14} radius={6} style={{ marginBottom: 8 }} />
          <Skeleton height={14} radius={6} style={{ marginBottom: 8 }} />
          <Skeleton height={14} radius={6} style={{ marginBottom: 24 }} />
          <Skeleton height={120} radius={12} />
        </div>
      </div>
    ),
  };

  const render = layouts[type] || layouts.dashboard;

  return (
    <div style={{ padding: 28 }}>
      {render()}
    </div>
  );
}
