import { Pi } from 'lucide-react';

type HeaderProps = {
  onHome: () => void;
};

export default function Header({ onHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={onHome} className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
            <Pi className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">
            Matematika<span className="text-violet-600">AI</span>
          </span>
        </button>

        <nav className="hidden sm:flex items-center gap-1 text-sm">
          <button
            onClick={onHome}
            className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors font-medium"
          >
            Pagrindinis
          </button>
        </nav>
      </div>
    </header>
  );
}
