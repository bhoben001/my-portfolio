import { useLayoutEffect, useRef, useState } from 'react';
import { Code2, ExternalLink, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Project, safeUrl } from '../data/siteData';

interface Props {
  proj: Project;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProjectCard({ proj, isAdmin, onEdit, onDelete }: Props) {
  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  // Only show the "Read more" toggle when the text is actually cut off.
  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const measure = () => {
      if (!expanded) setCanExpand(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [proj.description, expanded]);

  const descId = `desc-${proj.id}`;

  return (
    <div className="bg-[#1b1926] border border-[#2b273b] hover:border-[#3d3753] rounded-xl overflow-hidden shadow-xl flex flex-col justify-between transition-all">
      <div>
        <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center justify-between">
          <span className="text-xs font-mono text-[#78718f]">
            {proj.title.toLowerCase().replace(/\s+/g, '-')}
          </span>
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button onClick={onEdit} title="Edit project" className="text-[#78718f] hover:text-[#c4b5fd] transition-colors cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={onDelete} title="Delete project" className="text-[#78718f] hover:text-[#f87171] transition-colors cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="h-36 bg-[#13111c] border-b border-[#231f31] flex flex-col items-center justify-center p-4 text-center">
          <Code2 className="w-8 h-8 text-[#5e5380] mb-2" />
          <span className="text-sm font-mono font-semibold text-[#8b7db5] tracking-wide">
            {proj.iconText || proj.title}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="text-lg font-mono font-bold text-[#c4b5fd]">{proj.title}</h3>

          <p
            id={descId}
            ref={descRef}
            className={`text-xs font-sans text-[#a59eb8] leading-relaxed whitespace-pre-line break-words ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            {proj.description}
          </p>

          {(canExpand || expanded) && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls={descId}
              className="text-xs font-mono text-[#a78bfa] hover:text-[#d8d3f0] flex items-center gap-1 transition-colors cursor-pointer"
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}

          {proj.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {proj.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#241f33] text-[#9a8cb8] border border-[#332b49]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 pt-0 flex items-center gap-2">
        <a
          href={safeUrl(proj.codeUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-1.5 px-3 rounded-lg bg-[#201d2c] hover:bg-[#282437] text-[#c9c5d8] border border-[#322c44] text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>&lt;/&gt; Code</span>
        </a>

        {proj.demoUrl && (
          <a
            href={safeUrl(proj.demoUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-1.5 px-3 rounded-lg bg-[#c4b5fd] hover:bg-[#b39ef7] text-[#181622] text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Demo</span>
          </a>
        )}
      </div>
    </div>
  );
}
