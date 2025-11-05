import { FiLogOut } from "react-icons/fi";
import { cn } from "../lib/utils";
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
  handleLogout: () => void;
  isCollapsed?: boolean;
}

const Sidebar = ({ isOpen, onClose, user, handleLogout, isCollapsed = false }: SidebarProps) => {
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
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? 'opacity-100 md:opacity-0 md:pointer-events-none' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          `h-full flex flex-col bg-glass shadow-soft md:shadow-none border-r border-strong 
          backdrop-blur transition-all duration-300 ease-in-out overflow-hidden w-full`,
          isCollapsed ? 'w-20' : 'w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed top-0 left-0 bottom-0 z-50 md:relative md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-center h-20 flex-shrink-0">
          <h1 
            className={cn(
              "text-lg font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 px-2"
            )}
          >
            NoteX One
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6 space-y-1 flex-grow">
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
                title={isCollapsed ? label : undefined}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-full transition-all",
                    isActive ? 'w-1 bg-primary' : 'w-0 bg-transparent group-hover:w-1 group-hover:bg-primary/40'
                  )}
                />
                <div className={cn("flex items-center w-full", isCollapsed ? "justify-center" : "pl-2")}>
                  <div className="flex items-center gap-3 min-w-0">
                    <RenderIcon className={`text-lg flex-shrink-0 ${isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'}`} />
                    {!isCollapsed && <span className="truncate">{label}</span>}
                  </div>
                </div>
              </button>
            )
          })}

        </nav>

        <div className="border-t border-strong p-4 flex-shrink-0">
          <div className={cn("flex items-start gap-3", isCollapsed ? "flex-col items-center" : "")}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-semibold shadow-soft/60 flex-shrink-0">
              {(user?.name ?? user?.email ?? 'U')?.slice(0, 1).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{user?.name ?? 'Welcome back'}</p>
                <p className="text-xs text-secondary truncate">{user?.email ?? 'user@example.com'}</p>
                <div className="mt-3 flex items-center justify-between">
<button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg bg-layer px-3 py-2 text-xs font-medium text-secondary shadow-soft/30 hover:text-primary transition-colors"
                  >
                    <FiLogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
          {isCollapsed && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-layer text-secondary hover:text-primary transition-colors"
                title="Sign out"
              >
                <FiLogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
