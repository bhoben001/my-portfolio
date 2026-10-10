import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { inputCls, btnPrimary, btnGhost } from './ui';
import { friendlyError } from '../../lib/firebase';
import type { SkillGroup } from '../../data/siteData';

interface Props {
  initial: SkillGroup[];
  onSave: (groups: SkillGroup[]) => Promise<void>;
  onClose: () => void;
}

export default function SkillsEditor({ initial, onSave, onClose }: Props) {
  const [groups, setGroups] = useState<SkillGroup[]>(() => JSON.parse(JSON.stringify(initial)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (fn: (g: SkillGroup[]) => void) =>
    setGroups((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as SkillGroup[];
      fn(next);
      return next;
    });

  const submit = async () => {
    const cleaned = groups
      .map((g) => ({
        title: g.title.trim(),
        skills: g.skills.filter((s) => s.name.trim()).map((s) => ({ name: s.name.trim(), color: s.color })),
      }))
      .filter((g) => g.title);
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
    <Modal title="Edit Skills & Technologies" onClose={onClose} wide>
      <div className="space-y-6 text-xs font-mono">
        {groups.map((g, gi) => (
          <div key={gi} className="p-4 rounded-lg bg-[#14121c] border border-[#2b273b] space-y-3">
            <div className="flex gap-2">
              <input
                value={g.title}
                maxLength={40}
                onChange={(e) => update((d) => (d[gi].title = e.target.value.toUpperCase()))}
                placeholder="GROUP TITLE"
                className={inputCls}
              />
              <button
                onClick={() => update((d) => d.splice(gi, 1))}
                title="Remove group"
                className="text-[#78718f] hover:text-[#f87171] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {g.skills.map((s, si) => (
              <div key={si} className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => update((d) => (d[gi].skills[si].color = e.target.value))}
                  className="w-8 h-8 rounded bg-transparent border border-[#312a42] cursor-pointer"
                  aria-label="Dot colour"
                />
                <input
                  value={s.name}
                  maxLength={40}
                  onChange={(e) => update((d) => (d[gi].skills[si].name = e.target.value))}
                  placeholder="Technology name"
                  className={inputCls}
                />
                <button
                  onClick={() => update((d) => d[gi].skills.splice(si, 1))}
                  title="Remove"
                  className="text-[#78718f] hover:text-[#f87171] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {g.skills.length < 12 && (
              <button
                onClick={() => update((d) => d[gi].skills.push({ name: '', color: '#a78bfa' }))}
                className="text-[#a78bfa] hover:text-[#d8d3f0] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add technology
              </button>
            )}
          </div>
        ))}

        {groups.length < 6 && (
          <button
            onClick={() => update((d) => d.push({ title: 'NEW GROUP', skills: [{ name: '', color: '#a78bfa' }] }))}
            className="text-[#a78bfa] hover:text-[#d8d3f0] flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add group
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
