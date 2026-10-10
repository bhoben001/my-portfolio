import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Modal from './Modal';
import { btnGhost } from './ui';
import {
  CV_MAX_BYTES,
  bufferToBase64,
  deleteCv,
  fetchCv,
  friendlyError,
  saveCv,
  type CvDoc,
} from '../../lib/firebase';

export default function CvManager({ onClose }: { onClose: () => void }) {
  const [cv, setCv] = useState<CvDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCv().then((c) => {
      setCv(c);
      setLoading(false);
    });
  }, []);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMsg(null);

    if (file.size > CV_MAX_BYTES)
      return setMsg({ ok: false, text: `File is too big (max ${Math.round(CV_MAX_BYTES / 1000)} KB). Compress the PDF and try again.` });

    const buf = await file.arrayBuffer();
    const header = new TextDecoder().decode(new Uint8Array(buf, 0, 5));
    if (header !== '%PDF-') return setMsg({ ok: false, text: 'Only real PDF files are allowed.' });

    const doc: CvDoc = {
      fileName: file.name.replace(/[^\w.\- ]/g, '_').slice(0, 100),
      mimeType: 'application/pdf',
      dataBase64: bufferToBase64(buf),
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    setBusy(true);
    try {
      await saveCv(doc);
      setCv(doc);
      setMsg({ ok: true, text: 'CV uploaded. Visitors can download it now.' });
    } catch (err) {
      setMsg({ ok: false, text: friendlyError(err) });
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!confirm('Delete the uploaded CV?')) return;
    setBusy(true);
    try {
      await deleteCv();
      setCv(null);
      setMsg({ ok: true, text: 'CV deleted.' });
    } catch (err) {
      setMsg({ ok: false, text: friendlyError(err) });
    }
    setBusy(false);
  };

  return (
    <Modal title="Upload / Manage CV" onClose={onClose}>
      <div className="space-y-5 font-mono text-xs">
        <p className="text-[#a59eb8] leading-relaxed">
          Upload your CV as a <span className="text-[#c4b5fd]">PDF</span> (max {Math.round(CV_MAX_BYTES / 1000)} KB).
        </p>

        <div className="p-3.5 rounded-lg bg-[#14121c] border border-[#2b273b] space-y-1">
          <p className="text-[#78718f]">Current file:</p>
          {loading ? (
            <p className="text-[#8e88a3]">loading…</p>
          ) : cv ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#d8d3f0] font-semibold truncate">
                {cv.fileName} <span className="text-[#78718f] font-normal">({Math.round(cv.size / 1000)} KB)</span>
              </span>
              <button onClick={remove} disabled={busy} className="text-[#ff5f56] hover:underline cursor-pointer">Delete</button>
            </div>
          ) : (
            <p className="text-[#8e88a3] italic">No CV uploaded yet</p>
          )}
        </div>

        <input ref={fileRef} type="file" accept="application/pdf,.pdf" onChange={onFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-[#7b61ff] hover:bg-[#6c51f5] disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          {busy ? 'Working…' : cv ? 'Replace With New CV' : 'Upload CV (PDF)'}
        </button>

        {msg && <p className={msg.ok ? 'text-emerald-400' : 'text-rose-400'}>{msg.text}</p>}

        <div className="flex justify-end">
          <button onClick={onClose} className={btnGhost}>Close</button>
        </div>
      </div>
    </Modal>
  );
}
