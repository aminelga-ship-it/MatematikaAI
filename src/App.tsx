import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import Tutors from '@/components/Tutors';
import TutorThankYou from '@/components/TutorThankYou';
import TutorInquiryForm from '@/components/TutorInquiryForm';
import UsefulLinks from '@/components/UsefulLinks';
import Calculators from '@/components/Calculators';
import { pageview } from '@/lib/gtag';

type Page = 'home' | 'links';

function MainPages() {
  const [page, setPage] = useState<Page>('home');
  const navigate = useNavigate();

  const handleNavigate = (p: string) => {
    if (p === 'calculators') {
      navigate('/skaiciuotuvai');
      return;
    }
    if (p === 'tutors') {
      navigate('/korepetitoriai');
      return;
    }
    setPage(p as Page);
  };

  return (
    <>
      {page === 'home' && <Home onNavigate={handleNavigate} />}
      {page === 'links' && <UsefulLinks onBack={() => setPage('home')} />}
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    pageview(location.pathname + location.search);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onHome={() => navigate('/')} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MainPages />} />
          <Route path="/skaiciuotuvai" element={<Calculators />} />
          <Route path="/korepetitoriai/uzklausa-gauta" element={<TutorThankYou />} />
          <Route path="/korepetitoriai/uzklausa" element={<TutorInquiryForm />} />
          <Route path="/korepetitoriai" element={<Tutors />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
