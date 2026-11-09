import { Routes, Route } from 'react-router';
import { LoginPage } from './pages/LoginPage.tsx';

function App() {
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<p>Signed in</p>} />
      </Routes>
    </main>
  );
}

export default App;
