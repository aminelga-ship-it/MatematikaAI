import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import Tutors from '@/components/Tutors';
import EmptySection from '@/components/EmptySection';
import UsefulLinks from '@/components/UsefulLinks';
import Calculators from '@/components/Calculators';

type Page = 'home' | 'tutors' | 'calculators' | 'links';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: string) => setPage(p as Page);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onHome={() => setPage('home')} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={navigate} />}
        {page === 'tutors' && <Tutors onBack={() => setPage('home')} />}
        {page === 'calculators' && <Calculators onBack={() => setPage('home')} />}
        {page === 'links' && <UsefulLinks onBack={() => setPage('home')} />}
      </main>
      <Footer />
    </div>
  );
}
