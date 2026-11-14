import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api.ts';
import { Navigate, Outlet, Link, NavLink, useLocation } from 'react-router';
import { motion, MotionConfig, type Transition } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';

const NAV_PATHS = ['/', '/categories'];
// One spring for both moving and appearing, so they feel the same
const PILL_SPRING: Transition = { type: 'spring', bounce: 0.3, duration: 0.8 };
// Reverse of the appear spring: small swell, then shrink to zero.
// Keyframes instead of a spring: a spring to 0 would overshoot into negative scale.
const PILL_SHRINK: Transition = {
  duration: 0.3,
  times: [0, 0.3, 1],
  ease: ['easeOut', 'easeIn'],
};

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `relative rounded-lg px-3 py-1.5 font-medium transition-colors ${
    isActive ? 'text-ink' : 'text-muted hover:bg-accent-faint hover:text-ink'
  }`;
}

function NavItem({
  to,
  end,
  appear,
  shrink,
  children,
}: {
  to: string;
  end?: boolean;
  appear: boolean;
  shrink: boolean;
  children: ReactNode;
}) {
  return (
    <NavLink to={to} end={end} className={navLinkClass}>
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              initial={appear ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              className="absolute inset-0 rounded-lg bg-accent-soft"
              transition={PILL_SPRING}
            />
          )}
          {shrink && (
            <motion.span
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 0] }}
              className="absolute inset-0 rounded-lg bg-accent-soft"
              transition={PILL_SHRINK}
            />
          )}
          <span className="relative z-10">{children}</span>
        </>
      )}
    </NavLink>
  );
}

export function RequireAuth() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);
  const lastNavPathRef = useRef(NAV_PATHS.includes(pathname) ? pathname : null);
  const onNavPage = NAV_PATHS.includes(pathname);
  // Came to a nav page from a page without the pill (e.g. /profile)
  const pillAppear = !NAV_PATHS.includes(prevPathRef.current);
  // Left the nav pages: the last active link plays the shrink animation
  const shrinkPath = onNavPage ? null : lastNavPathRef.current;

  useEffect(() => {
    prevPathRef.current = pathname;
    if (NAV_PATHS.includes(pathname)) lastNavPathRef.current = pathname;
  }, [pathname]);

  const { data, isPending, error } = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ email: string }>('/auth/me'),
    retry: false,
  });

  if (isPending) return <p>Loading...</p>;
  if (error) return <Navigate to="/login" replace />;

  return (
    <>
      <header className="border-b border-line bg-surface sticky top-0">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted"
          >
            <span className="size-2.5 rounded-full bg-accent" />
            Networthy
          </Link>
          <MotionConfig reducedMotion="user">
            <nav className="flex gap-1 text-sm">
              <NavItem
                to="/"
                end
                appear={pillAppear}
                shrink={shrinkPath === '/'}
              >
                Accounts
              </NavItem>
              <NavItem
                to="/categories"
                appear={pillAppear}
                shrink={shrinkPath === '/categories'}
              >
                Categories
              </NavItem>
            </nav>
          </MotionConfig>
          <Link
            to="/profile"
            className="flex size-9 items-center justify-center rounded-full bg-accent-soft font-semibold"
          >
            {data.email.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>
      <div className="p-8">
        <Outlet />
      </div>
    </>
  );
}
