import { Routes, Route } from 'react-router';
import { LoginPage } from './pages/LoginPage.tsx';
import { AccountsPage } from './pages/AccountsPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { RequireAuth } from './components/RequireAuth.tsx';
import { Toaster } from 'sonner';

function App() {
  return (
    <main className="min-h-screen bg-page text-ink">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AccountsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" richColors />
    </main>
  );
}

export default App;
