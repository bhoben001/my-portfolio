import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Modal from './Modal';
import { inputCls, btnPrimary, btnGhost } from './ui';
import { friendlyError } from '../../lib/firebase';
import type { ExperienceItem } from '../../data/siteData';

interface Props {
  initial: ExperienceItem[];
  onSave: (items: ExperienceItem[]) => Promise<void>;
  onClose: () => void;
}

export default function ExperienceEditor({ initial, onSave, onClose }: Props) {
  const [items, setItems] = useState<ExperienceItem[]>(() => JSON.parse(JSON.stringify(initial)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (fn: (d: ExperienceItem[]) => void) =>
    setItems((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as ExperienceItem[];
      fn(next);
      return next;
    });

  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.length) return;
      [d[i], d[j]] = [d[j], d[i]];
    });

  const submit = async () => {
    const cleaned = items
      .map((x) => ({ ...x, title: x.title.trim(), subtitle: x.subtitle.trim(), period: x.period.trim() }))
      .filter((x) => x.title);
    setSaving(true);
    setError('');
    try {
      await onSave(cleaned);
      onClose();
    } catch (e) {
      setError(friendlyError(e));
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Experience" onClose={onClose} wide>
      <div className="space-y-4 text-xs font-mono">
        {items.map((it, i) => (
          <div key={i} className="p-4 rounded-lg bg-[#14121c] border border-[#2b273b] space-y-2">
            <input value={it.title} maxLength={80} onChange={(e) => update((d) => (d[i].title = e.target.value))} placeholder="Title" className={inputCls} />
            <input value={it.subtitle} maxLength={160} onChange={(e) => update((d) => (d[i].subtitle = e.target.value))} placeholder="Subtitle / details" className={inputCls} />
            <input value={it.period} maxLength={40} onChange={(e) => update((d) => (d[i].period = e.target.value))} placeholder="2026 – Present" className={inputCls} />
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[#a59eb8] cursor-pointer">
                <input type="checkbox" checked={!!it.highlight} onChange={(e) => update((d) => (d[i].highlight = e.target.checked))} />
                Highlight box
              </label>
              <div className="flex items-center gap-3 text-[#78718f]">
                <button onClick={() => move(i, -1)} title="Move up" className="hover:text-[#d4d0e6] cursor-pointer"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(i, 1)} title="Move down" className="hover:text-[#d4d0e6] cursor-pointer"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => update((d) => d.splice(i, 1))} title="Remove" className="hover:text-[#f87171] cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}

        {items.length < 20 && (
          <button
            onClick={() => update((d) => d.unshift({ title: '', subtitle: '', period: '' }))}
            className="text-[#a78bfa] hover:text-[#d8d3f0] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add entry (at top)
          </button>
        )}

        {error && <p className="text-rose-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className={btnGhost}>Cancel</button>
          <button onClick={submit} disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </Modal>
  );
}
