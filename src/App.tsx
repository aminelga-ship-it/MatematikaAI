import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import Tutors from '@/components/Tutors';
import UsefulLinks from '@/components/UsefulLinks';
import Calculators from '@/components/Calculators';

type Page = 'home' | 'tutors' | 'links';

function MainPages() {
  const [page, setPage] = useState<Page>('home');
  const navigate = useNavigate();

  const handleNavigate = (p: string) => {
    if (p === 'calculators') {
      navigate('/skaiciuotuvai');
      return;
    }
    setPage(p as Page);
  };

  return (
    <>
      {page === 'home' && <Home onNavigate={handleNavigate} />}
      {page === 'tutors' && <Tutors onBack={() => setPage('home')} />}
      {page === 'links' && <UsefulLinks onBack={() => setPage('home')} />}
    </>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onHome={() => navigate('/')} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MainPages />} />
          <Route path="/skaiciuotuvai" element={<Calculators />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
