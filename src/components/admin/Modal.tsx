import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({ title, onClose, children, wide }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-[#1b1926] border border-[#3b3252] rounded-xl w-full ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        } overflow-hidden shadow-2xl my-8`}
      >
        <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center justify-between">
          <span className="text-xs font-mono text-[#c4b5fd]">{title}</span>
          <button onClick={onClose} aria-label="Close" className="text-[#78718f] hover:text-[#d4d0e6] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
