import { useState } from 'react';
import Modal from './Modal';
import { inputCls, btnPrimary, btnGhost } from './ui';
import { friendlyError } from '../../lib/firebase';
import { safeUrl, type Project } from '../../data/siteData';

interface Props {
  initial?: Project;
  onSave: (p: Project) => Promise<void>;
  onClose: () => void;
}

export default function ProjectEditor({ initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '');
  const [codeUrl, setCodeUrl] = useState(initial?.codeUrl ?? '');
  const [demoUrl, setDemoUrl] = useState(initial?.demoUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (safeUrl(codeUrl.trim()) === '#') return setError('GitHub link must be a valid http(s) URL.');
    if (demoUrl.trim() && safeUrl(demoUrl.trim()) === '#') return setError('Demo link must be a valid http(s) URL.');

    const project: Project = {
      id: initial?.id ?? `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 12),
      codeUrl: codeUrl.trim(),
      demoUrl: demoUrl.trim() || undefined,
      iconText: title.trim(),
    };
    setSaving(true);
    setError('');
    try {
      await onSave(project);
      onClose();
    } catch (err) {
      setError(friendlyError(err));
      setSaving(false);
    }
  };

  return (
    <Modal title={initial ? 'Edit Project' : 'Add New Project'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4 text-xs font-mono">
        <div>
          <label className="block text-[#78718f] mb-1">Project Title *</label>
          <input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[#78718f] mb-1">Description * (long text is fine – visitors get "Read more")</label>
          <textarea required rows={6} maxLength={5000} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-[#78718f] mb-1">GitHub Repo Link *</label>
          <input required type="url" value={codeUrl} onChange={(e) => setCodeUrl(e.target.value)} placeholder="https://github.com/..." className={inputCls} />
        </div>
        <div>
          <label className="block text-[#78718f] mb-1">Live Demo Link (optional)</label>
          <input type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://..." className={inputCls} />
        </div>
        <div>
          <label className="block text-[#78718f] mb-1">Tech Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Java, Spring Boot, MySQL" className={inputCls} />
        </div>
        {error && <p className="text-rose-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
