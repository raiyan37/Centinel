/**
 * Sidebar Component
 *
 * Navigation sidebar with links to all main pages.
 * Hidden on mobile, shows as fixed sidebar on desktop.
 * Includes user info and logout button.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  Receipt,
  LogOut,
} from 'lucide-react';

// Navigation items
const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/pots', label: 'Pots', icon: Wallet },
  { to: '/recurring-bills', label: 'Recurring Bills', icon: Receipt },
];

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[300px] lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-[var(--color-grey-900)] px-6 pb-4 rounded-r-2xl">
          {/* Logo */}
          <div className="flex h-20 shrink-0 items-center">
            <img
              src="/assets/images/logo-large.svg"
              alt="Centinel"
              className="h-6 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-x-3 rounded-r-xl py-3 px-4 text-sm font-medium transition-all border-l-4',
                        isActive
                          ? 'bg-[var(--color-beige-100)] text-[var(--color-grey-900)] border-[var(--color-green)]'
                          : 'text-[var(--color-grey-300)] hover:text-white hover:bg-white/5 border-transparent'
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* User section at bottom */}
            {user && (
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 py-3">
                  <Avatar size="sm">
                    <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                    <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-[var(--color-grey-300)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex w-full items-center gap-x-3 rounded-lg py-2 px-4 text-sm font-medium text-[var(--color-grey-300)] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="fixed inset-x-0 bottom-0 z-50 bg-[var(--color-grey-900)] px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] lg:hidden rounded-t-xl"
        aria-label="Mobile navigation"
      >
        <ul className="flex items-center justify-around" role="menubar">
          {navItems.map((item) => (
            <li key={item.to} role="none">
              <NavLink
                to={item.to}
                role="menuitem"
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-grey-900)]',
                    isActive
                      ? 'text-[var(--color-green)]'
                      : 'text-[var(--color-grey-300)]'
                  )
                }
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-xs font-medium hidden sm:block">
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
          {/* Mobile logout button */}
          <li role="none">
            <button
              onClick={handleLogout}
              role="menuitem"
              aria-label="Logout"
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-[var(--color-grey-300)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-green)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-grey-900)]"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium hidden sm:block">Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
