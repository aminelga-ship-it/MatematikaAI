export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-4 text-center">
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} MatematikaAI. Visos teisės saugomos.
        </p>
      </div>
    </footer>
  );
}
