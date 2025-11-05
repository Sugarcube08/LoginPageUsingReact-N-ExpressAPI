import { FiLogOut, FiMoon, FiSun,} from "react-icons/fi";
import { IoHomeOutline, IoHomeSharp, IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom"
import type { NavItem } from "../types/typeComponents";
import { RiBookletFill, RiBookletLine } from "react-icons/ri";
import { FaRegUserCircle, FaUserCircle } from "react-icons/fa";

const navItems: NavItem[] = [
  { path: "dashboard", label: "Dashboard", icon: IoHomeOutline, activeIcon: IoHomeSharp },
  { path: "notebooks", label: "Notebooks", icon: RiBookletLine, activeIcon: RiBookletFill },
  { path: "profile", label: "Profile", icon: FaRegUserCircle, activeIcon: FaUserCircle },
  { path: "settings", label: "Settings", icon: IoSettingsOutline, activeIcon: IoSettingsSharp },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isDark: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
}

const Sidebar = ({ isOpen, onClose, user, isDark, toggleTheme, handleLogout }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const activeSegment = location.pathname.startsWith('/user/')
    ? location.pathname.replace('/user/', '')
    : 'dashboard'

  const handleNavigate = (path: string) => {
    navigate(`/user/${path}`)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 bg-glass shadow-soft md:shadow-none 
          border-r border-strong transition-transform duration-300 ease-in-out z-50 flex flex-col 
          backdrop-blur`}
      >
        <div className="flex items-center justify-between px-6 h-20">
          <h1 className="text-lg font-semibold">Login Portal</h1>
          <button
            onClick={toggleTheme}
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full 
              bg-layer text-secondary shadow-soft/40 hover:text-primary transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
          {navItems.map(({ path, label, icon: Icon, activeIcon: ActiveIcon }) => {
            const isActive = activeSegment.startsWith(path)
            const RenderIcon = isActive && ActiveIcon ? ActiveIcon : Icon

            return (
              <button
                key={path}
                onClick={() => {
                  handleNavigate(path)
                  onClose()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm 
                    font-medium transition-all duration-200 ${isActive
                    ? 'bg-primary/15 text-primary shadow-inner'
                    : 'text-secondary hover:bg-layer hover:text-primary'
                  }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full transition-all ${isActive ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/40'
                    }`}
                />
                <RenderIcon className={`text-lg ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
                {label}
              </button>
            )
          })}

        </nav>

        <div className="border-t border-strong px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-semibold shadow-soft/60">
              {(user?.name ?? user?.email ?? 'U')?.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">{user?.name ?? 'Welcome back'}</p>
              <p className="text-xs text-secondary truncate">{user?.email ?? 'user@example.com'}</p>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="md:hidden inline-flex items-center gap-2 text-xs font-medium text-secondary hover:text-primary"
                >
                  {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-layer px-3 py-2 text-xs font-medium text-secondary shadow-soft/30 hover:text-primary transition-colors"
                >
                  <FiLogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
