import { Routes, Route } from 'react-router';
import { LoginPage } from './pages/LoginPage.tsx';
import { AccountsPage } from './pages/AccountsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { RequireAuth } from './components/RequireAuth.tsx';

function App() {
  return (
    <main className="min-h-screen bg-page text-ink">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AccountsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </main>
  );
}

export default App;
