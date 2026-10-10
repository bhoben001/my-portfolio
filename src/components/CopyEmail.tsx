import { useEffect, useRef, useState } from 'react';
import { Mail, Copy, Check } from 'lucide-react';

interface Props {
  email: string;
  variant?: 'card' | 'inline';
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy method */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Shows an email address; clicking copies it to the clipboard instead of opening a mail app. */
export default function CopyEmail({ email, variant = 'card' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(email);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  const label =
    state === 'copied' ? 'Copied!' : state === 'failed' ? 'Press Ctrl+C' : 'Copy';
  const StatusIcon = state === 'copied' ? Check : Copy;

  const base =
    variant === 'card'
      ? 'w-full flex items-center gap-3 text-sm font-mono text-[#c4b5fd] hover:text-[#d8d3f0] transition-colors p-3 rounded-lg bg-[#14121c] border border-[#292437] hover:border-[#3d3753] text-left cursor-pointer'
      : 'inline-flex items-center gap-2 text-[#c4b5fd] hover:text-[#d8d3f0] transition-colors text-left cursor-pointer';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Click to copy email"
      aria-label={`Copy email address ${email}`}
      className={base}
    >
      {variant === 'card' && <Mail className="w-5 h-5 text-[#a78bfa] shrink-0" />}
      <span className="select-all break-all">{email}</span>
      <span
        className={`ml-auto shrink-0 flex items-center gap-1 text-xs ${
          state === 'copied' ? 'text-emerald-400' : 'text-[#78718f]'
        }`}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied' ? 'Email copied to clipboard' : ''}
      </span>
    </button>
  );
}
