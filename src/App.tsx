import { useEffect, useRef, useState } from 'react';
import {
  Download, ArrowRight, X, Linkedin, Github, FolderGit2,
  Lock, Unlock, Plus, Pencil, FileText,
} from 'lucide-react';
import avatarPhoto from './assets/images/bhoben-avatar.webp';
import CopyEmail from './components/CopyEmail';
import ProjectCard from './components/ProjectCard';
import ProjectEditor from './components/admin/ProjectEditor';
import SkillsEditor from './components/admin/SkillsEditor';
import ExperienceEditor from './components/admin/ExperienceEditor';
import CvManager from './components/admin/CvManager';
import { btnSmall } from './components/admin/ui';
import { useAuth } from './hooks/useAuth';
import {
  SITE, defaultContent,
  type SiteContent, type Project,
} from './data/siteData';
import {
  firebaseEnabled, fetchContent, saveContent, fetchCv, downloadCv,
  loginWithGoogle, logout, friendlyError,
} from './lib/firebase';

// Custom X (Twitter) Icon
function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type ModalState =
  | null
  | { type: 'project'; project?: Project }
  | { type: 'skills' }
  | { type: 'experience' }
  | { type: 'cv' };

export default function App() {
  const [activeNav, setActiveNav] = useState<'home' | 'achievements' | 'links'>('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [cvAlertMessage, setCvAlertMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [status, setStatus] = useState<'loading' | 'ready'>(firebaseEnabled ? 'loading' : 'ready');
  const [modal, setModal] = useState<ModalState>(null);
  const alertTimer = useRef<number | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);
  const { user, isAdmin } = useAuth();

  useEffect(
    () => () => {
      window.clearTimeout(alertTimer.current);
      window.clearTimeout(noticeTimer.current);
    },
    [],
  );

  // Load the saved content from Firebase (falls back to the built-in defaults)
  useEffect(() => {
    let alive = true;
    fetchContent()
      .then((c) => alive && c && setContent(c))
      .finally(() => alive && setStatus('ready'));
    return () => {
      alive = false;
    };
  }, []);

  const flash = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3500);
  };

  // Anyone who signs in with a non-admin Google account is signed straight out again.
  useEffect(() => {
    if (user && !isAdmin) {
      flash(false, 'This Google account is not the admin account.');
      logout();
    }
  }, [user, isAdmin]);

  // Close the contact modal with the Escape key
  useEffect(() => {
    if (!isContactOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsContactOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isContactOpen]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      flash(false, friendlyError(e));
    }
  };

  // Save to Firebase first; only update the page if the save really worked.
  const persist = async (next: SiteContent, okMsg: string) => {
    await saveContent(next);
    setContent(next);
    flash(true, okMsg);
  };

  const saveProject = (p: Project) => {
    const exists = content.projects.some((x) => x.id === p.id);
    const projects = exists
      ? content.projects.map((x) => (x.id === p.id ? p : x))
      : [p, ...content.projects];
    return persist({ ...content, projects }, exists ? 'Project updated.' : 'Project added.');
  };

  const deleteProject = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await persist({ ...content, projects: content.projects.filter((x) => x.id !== p.id) }, 'Project deleted.');
    } catch (e) {
      flash(false, friendlyError(e));
    }
  };

  const showCvAlert = (msg: string) => {
    setCvAlertMessage(msg);
    window.clearTimeout(alertTimer.current);
    alertTimer.current = window.setTimeout(() => setCvAlertMessage(null), 3000);
  };

  // CV: uploaded PDF from Firebase first, then an optional static file in /public
  const handleDownloadCV = async () => {
    const cv = await fetchCv();
    if (cv) {
      downloadCv(cv);
      return;
    }
    const url = `${import.meta.env.BASE_URL}${SITE.cvFile}`;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const type = res.headers.get('content-type') || '';
      if (!res.ok || type.includes('text/html')) throw new Error('missing');
    } catch {
      showCvAlert('cv not uploaded');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = SITE.cvFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const fade = `transition-opacity duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}`;

  return (
    <div className="min-h-screen bg-[#181622] text-[#c9c5d8] font-sans selection:bg-[#7b61ff]/30 selection:text-[#c4b5fd]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#181622]/90 backdrop-blur-md border-b border-[#2b273b]/60">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href="/"
            className="text-lg font-mono font-medium text-[#c4b5fd] hover:text-[#d8ccff] transition-colors flex items-center gap-2"
          >
            <span className="text-[#a78bfa]">&gt;</span> bhoben-portfolio
          </a>

          <div className="flex items-center gap-7 text-sm font-sans">
            <button
              onClick={() => {
                setActiveNav("achievements");
                scrollToSection("experience");
              }}
              className={`transition-colors ${
                activeNav === "achievements"
                  ? "text-[#c4b5fd]"
                  : "text-[#8e88a3] hover:text-[#c9c5d8]"
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => {
                setActiveNav("links");
                scrollToSection("contact");
              }}
              className={`transition-colors ${
                activeNav === "links"
                  ? "text-[#c4b5fd]"
                  : "text-[#8e88a3] hover:text-[#c9c5d8]"
              }`}
            >
              Links
            </button>

            {firebaseEnabled &&
              (isAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModal({ type: "cv" })}
                    className={btnSmall}
                  >
                    <FileText className="w-3 h-3 text-[#a78bfa]" /> CV
                  </button>
                  <button
                    onClick={() => setModal({ type: "project" })}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-[#7b61ff] hover:bg-[#6c51f5] text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Project
                  </button>
                  <button
                    onClick={() => logout()}
                    title="Sign out"
                    className={btnSmall}
                  >
                    <Unlock className="w-3 h-3 text-[#a78bfa]" /> Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  title="Admin login"
                  aria-label="Admin login"
                  className="text-[#615a77] hover:text-[#c4b5fd] transition-colors p-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              ))}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 text-center px-4">
        {/* Avatar with dashed circle border */}
        <div className="flex justify-center mb-7">
          <div className="relative p-1.5 rounded-full border border-dashed border-[#554b73]">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden bg-gradient-to-b from-[#2d2644] to-[#1d192b] shadow-inner">
              <img
                src={avatarPhoto}
                alt="Bhoben Narzary"
                width={512}
                height={512}
                decoding="async"
                fetchPriority="high"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <p className="text-sm font-sans text-[#8e88a3] mb-3">Hello, I'm</p>

        {/* Dual color name styling: BHOBEN Narzary */}
        <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tight mb-4">
          <span className="text-[#c4b5fd]">BHOBEN</span>{" "}
          <span className="text-[#d8d3f0]">Narzary</span>
        </h1>

        <p className="text-sm text-[#8e88a3] font-sans flex items-center justify-center gap-2 mb-8">
          <span>Backend Developer</span>
          <span>•</span>
          <span>Java &amp; Spring Specialist</span>
        </p>

        {/* Download CV and Contact Info buttons */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleDownloadCV}
              className="px-5 py-2.5 rounded-lg bg-[#c4b5fd] hover:bg-[#b39ef7] text-[#181622] font-semibold text-sm transition-colors flex items-center gap-2 shadow-md shadow-[#c4b5fd]/10"
            >
              <Download className="w-4 h-4" />
              Download CV
            </button>

            <button
              onClick={() => setIsContactOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#201d2c] hover:bg-[#282437] text-[#c9c5d8] border border-[#322c44] font-medium text-sm transition-colors flex items-center gap-2"
            >
              Contact Info
              <ArrowRight className="w-4 h-4 text-[#8e88a3]" />
            </button>
          </div>

          {/* Toast / Notice when CV is not uploaded */}
          {cvAlertMessage && (
            <div className="font-mono text-xs text-[#ff5f56] bg-[#2d1b1b] border border-[#522b2b] px-3.5 py-1.5 rounded-lg animate-fade-in shadow-md">
              {cvAlertMessage}
            </div>
          )}
        </div>
      </section>

      {/* Terminal Section (# whoami & # skills) */}
      <section className="max-w-4xl mx-auto px-4 mb-28">
        <div className="bg-[#1b1926] border border-[#2b273b] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center">
            <span className="text-xs font-mono text-[#78718f]">
              guest@bhoben: ~
            </span>
          </div>

          <div className="p-6 font-mono text-sm space-y-5">
            <div>
              <p className="text-[#a78bfa] mb-2">
                <span className="text-[#c4b5fd]">#&nbsp;</span>whoami
              </p>
              <p className="text-[#b5afca] pl-1 leading-relaxed">
                {" "}
                A backend developer who loves building Java application
              </p>
            </div>

            <div>
              <p className="text-[#a78bfa] mb-2">
                <span className="text-[#c4b5fd]">#&nbsp;</span>skills
              </p>
              <p className="text-[#b5afca] pl-1 flex items-center gap-2">
                <span>Java &amp; Spring Boot</span>
                <span className="text-[#78718f]">•</span>
                <span>Relational Database</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: About Me */}
      <section id="about" className="max-w-4xl mx-auto px-4 mb-28">
        <h2 className="text-3xl font-mono font-bold text-center text-[#d8d3f0] mb-10 flex items-center justify-center gap-2">
          <span className="text-[#a78bfa]">|</span> About Me
        </h2>

        <div className="bg-[#1b1926] border border-[#2b273b] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center">
            <span className="text-xs font-mono text-[#78718f]">about-me</span>
          </div>

          <div className="p-6 font-mono text-sm text-[#b5afca] space-y-4 leading-relaxed">
            <p>
              I'm a 2nd year Computer Science student who enjoys building things and
              understanding how they work behind the scenes. I'm particularly interested 
              in backend development, working with Java and Spring Boot, and turning ideas into projects. 
            </p>
            <p>
              I enjoy solving problems, exploring new technologies, and learning by
              actually building things rather than just following tutorials.</p>
              <p>
                I'm still learning, still experimenting, and figuring out what I want to build next.
                For me, every project is a chance to get a little better at what I do.
              </p>
          </div>
        </div>
      </section>

      {/* Section: Skills & Technologies */}
      <section id="skills" className={`max-w-4xl mx-auto px-4 mb-28 ${fade}`}>
        <h2 className="text-3xl font-mono font-bold text-center text-[#d8d3f0] mb-2 flex items-center justify-center gap-2">
          <span className="text-[#a78bfa]">|</span> Skills &amp; Technologies
        </h2>
        <p className="text-center text-xs font-sans text-[#7e7894] mb-10">
          Technologies and tools I work with:
        </p>
        {isAdmin && (
          <div className="flex justify-center -mt-6 mb-8">
            <button
              onClick={() => setModal({ type: "skills" })}
              className={btnSmall}
            >
              <Pencil className="w-3 h-3 text-[#a78bfa]" /> Edit skills
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.skillGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-xs font-mono font-semibold text-[#a78bfa] tracking-wider uppercase mb-4">
                {group.title}
              </h3>
              {group.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="bg-[#1b1926] border border-[#2b273b] rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />
                  <span className="font-mono text-sm text-[#d4d0e6]">
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Section: Experience */}
      <section
        id="experience"
        className={`max-w-4xl mx-auto px-4 mb-28 ${fade}`}
      >
        <h2 className="text-3xl font-mono font-bold text-center text-[#d8d3f0] mb-2 flex items-center justify-center gap-2">
          <span className="text-[#a78bfa]">|</span> Experience
        </h2>
        <p className="text-center text-xs font-sans text-[#7e7894] mb-10">
          My journey &amp; milestones:
        </p>
        {isAdmin && (
          <div className="flex justify-center -mt-6 mb-8">
            <button
              onClick={() => setModal({ type: "experience" })}
              className={btnSmall}
            >
              <Pencil className="w-3 h-3 text-[#a78bfa]" /> Edit experience
            </button>
          </div>
        )}

        <div className="bg-[#1b1926] border border-[#2b273b] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center">
            <span className="text-xs font-mono text-[#78718f]">experience</span>
          </div>

          <div className="p-6 font-mono text-xs space-y-6">
            {content.experience.map((item) => (
              <div
                key={item.title + item.period}
                className={
                  item.highlight
                    ? "p-3.5 rounded-lg bg-[#241f33] border-l-2 border-[#a78bfa] space-y-1"
                    : "space-y-1"
                }
              >
                <p className="text-[#c4b5fd] font-semibold text-sm">
                  {item.title}
                </p>
                <p className="text-[#d4d0e6]">{item.subtitle}</p>
                <p className="text-[#78718f]">{item.period}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Projects */}
      <section id="projects" className={`max-w-6xl mx-auto px-4 mb-28 ${fade}`}>
        <h2 className="text-3xl font-mono font-bold text-center text-[#d8d3f0] mb-2">
          <span className="text-[#a78bfa]">|</span> Projects
        </h2>

        <p className="text-center text-xs font-sans text-[#7e7894] mb-10">
          Selected software and backend repositories:
        </p>

        {content.projects.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-[#1b1926] border border-[#2b273b] rounded-xl p-10 text-center shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#241f33] border border-[#3b3353] flex items-center justify-center mx-auto mb-4 text-[#a78bfa]">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <p className="font-mono text-sm text-[#b5afca] mb-6">
              no projects yet. coming soon
            </p>
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex px-4 py-2 rounded-lg bg-[#201d2c] hover:bg-[#282437] border border-[#322c44] text-xs font-mono text-[#c4b5fd] items-center gap-2 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Visit github.com/bhoben001</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {content.projects.map((proj) => (
              <ProjectCard
                key={proj.id}
                proj={proj}
                isAdmin={isAdmin}
                onEdit={() => setModal({ type: "project", project: proj })}
                onDelete={() => deleteProject(proj)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section: Get in Touch */}
      <section id="contact" className="max-w-xl mx-auto px-4 mb-24">
        <h2 className="text-3xl font-mono font-bold text-center text-[#d8d3f0] mb-10 flex items-center justify-center gap-2">
          <span className="text-[#a78bfa]">|</span> Get in Touch
        </h2>

        <div className="bg-[#1b1926] border border-[#2b273b] rounded-xl overflow-hidden shadow-2xl">
          <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center">
            <span className="text-xs font-mono text-[#78718f]">
              contact-info
            </span>
          </div>

          <div className="p-6 space-y-6">
            <CopyEmail email={SITE.email} />

            <div>
              <p className="text-xs font-sans text-[#78718f] mb-3">
                Social Media Profiles
              </p>

              <div className="space-y-2.5">
                <a
                  href="https://x.com/bhaben001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#201d2c] hover:bg-[#282437] border border-[#2e283e] text-xs font-mono text-[#d4d0e6] transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-[#2c263c] flex items-center justify-center text-[#c4b5fd]">
                    <XIcon className="w-3.5 h-3.5" />
                  </div>
                  <span>X (twitter.com/bhaben001)</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/bhoben-narzary/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#201d2c] hover:bg-[#282437] border border-[#2e283e] text-xs font-mono text-[#d4d0e6] transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-[#2c263c] flex items-center justify-center text-[#c4b5fd]">
                    <Linkedin className="w-3.5 h-3.5" />
                  </div>
                  <span>LinkedIn (in/bhoben-narzary)</span>
                </a>

                <a
                  href="https://github.com/bhoben001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#201d2c] hover:bg-[#282437] border border-[#2e283e] text-xs font-mono text-[#d4d0e6] transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-[#2c263c] flex items-center justify-center text-[#c4b5fd]">
                    <Github className="w-3.5 h-3.5" />
                  </div>
                  <span>Git (github.com/bhoben001)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#231f31] py-8 text-center text-xs font-mono text-[#5b5470]">
        <p>
          © {new Date().getFullYear()} Bhoben Narzary • Built with clean code
        </p>
      </footer>

      {/* Contact Info Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1b1926] border border-[#2b273b] rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-4 py-2.5 bg-[#1e1b2b] border-b border-[#2b273b] flex items-center justify-between">
              <span className="text-xs font-mono text-[#c4b5fd]">
                Contact Information
              </span>
              <button
                onClick={() => setIsContactOpen(false)}
                className="text-[#78718f] hover:text-[#d4d0e6] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 font-mono text-xs">
              <div>
                <p className="text-[#78718f] mb-1">Email</p>
                <CopyEmail email={SITE.email} variant="inline" />
              </div>

              <div>
                <p className="text-[#78718f] mb-1">GitHub</p>
                <a
                  href="https://github.com/bhoben001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c4b5fd] hover:underline"
                >
                  github.com/bhoben001
                </a>
              </div>

              <div>
                <p className="text-[#78718f] mb-1">LinkedIn</p>
                <a
                  href="https://www.linkedin.com/in/bhoben-narzary/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c4b5fd] hover:underline"
                >
                  linkedin.com/in/bhoben-narzary
                </a>
              </div>

              <div>
                <p className="text-[#78718f] mb-1">X (Twitter)</p>
                <a
                  href="https://x.com/bhaben001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c4b5fd] hover:underline"
                >
                  x.com/bhaben001
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin modals */}
      {isAdmin && modal?.type === "project" && (
        <ProjectEditor
          initial={modal.project}
          onSave={saveProject}
          onClose={() => setModal(null)}
        />
      )}
      {isAdmin && modal?.type === "skills" && (
        <SkillsEditor
          initial={content.skillGroups}
          onSave={(skillGroups) =>
            persist({ ...content, skillGroups }, "Skills updated.")
          }
          onClose={() => setModal(null)}
        />
      )}
      {isAdmin && modal?.type === "experience" && (
        <ExperienceEditor
          initial={content.experience}
          onSave={(experience) =>
            persist({ ...content, experience }, "Experience updated.")
          }
          onClose={() => setModal(null)}
        />
      )}
      {isAdmin && modal?.type === "cv" && (
        <CvManager onClose={() => setModal(null)} />
      )}

      {/* Toast */}
      {notice && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] font-mono text-xs px-4 py-2 rounded-lg shadow-xl border ${
            notice.ok
              ? "bg-[#16241c] border-[#2b5238] text-emerald-300"
              : "bg-[#2d1b1b] border-[#522b2b] text-[#ff8a84]"
          }`}
        >
          {notice.text}
        </div>
      )}
    </div>
  );
}
