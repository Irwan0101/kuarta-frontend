import { useState, useCallback } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', confirmLabel: '', confirmColor: '', icon: null });
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, message, title: opts.title || 'Konfirmasi', confirmLabel: opts.confirmLabel || 'Ya, Hapus', confirmColor: opts.confirmColor || '#EF4444', icon: opts.icon || null });
      setResolver(() => (val) => {
        setState(s => ({ ...s, open: false }));
        resolve(val);
      });
    });
  }, []);

  const handleConfirm = () => resolver?.(true);
  const handleCancel = () => resolver?.(false);

  const modal = (
    <ConfirmModal
      open={state.open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      confirmColor={state.confirmColor}
      icon={state.icon}
    />
  );

  return { confirm, modal };
}
