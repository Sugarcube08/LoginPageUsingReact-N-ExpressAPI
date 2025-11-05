import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { FiSun, FiMoon, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { apiService } from "../services/ApiService"
import type { ApiConfig } from "../services/ApiService"
import { useTheme } from "../hooks/useTheme"
import Sidebar from "../components/Sidebar"
import { cn } from "../lib/utils"

const UserLayout = () => {
  const { isDark, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const api: ApiConfig = {
    url: "/users/user",
    method: "GET",
  }

  // Check authentication & fetch user profile
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth/login')
      return
    }

    let isMounted = true

    apiService(api)
      .then((res) => {
        if (isMounted && res?.data) {
          setUser(res.data)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user profile', error)
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  // Keep theme in sync when layout mounts
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Close sidebar when route changes (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const activeSegment = location.pathname.startsWith('/user/')
    ? location.pathname.replace('/user/', '')
    : 'dashboard'

  const activeNav = useMemo(() => {
    if (activeSegment === 'dashboard') return 'Dashboard'
    if (activeSegment === 'notebooks') return 'Notebooks'
    if (activeSegment.startsWith('profile')) return 'Profile'
    if (activeSegment.startsWith('settings')) return 'Settings'
    if (activeSegment.startsWith('notebooks')) return 'Notebooks'
    return 'Dashboard'
  }, [activeSegment])

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleCollapseSidebar = () => setIsSidebarCollapsed(prev => !prev)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/auth/login')
  }

  return (
    <div className="relative min-h-screen bg-canvas bg-aurora text-primary transition-colors duration-300">
      <div className="flex min-h-screen">
        {/* Mobile menu toggle arrow */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-50 h-12 w-6 flex items-center justify-center rounded-r-lg bg-primary/90 text-white shadow-lg hover:bg-primary transition-all duration-300 transform",
            isSidebarOpen && "translate-x-0",
            !isSidebarOpen && "translate-x-0"
          )}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <FiChevronLeft size={20} />
          ) : (
            <FiChevronRight size={20} />
          )}
        </button>

        {/* Sidebar Component */}
        <div className={cn(
          "fixed md:relative h-screen transition-all duration-300 ease-in-out z-40",
          isSidebarOpen ? "w-72" : (isSidebarCollapsed ? "w-20" : "w-72"),
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            user={user}
            handleLogout={handleLogout}
            isCollapsed={!isSidebarOpen && isSidebarCollapsed}
          />

          {/* Desktop collapse/expand button */}
          <button
            onClick={toggleCollapseSidebar}
            className="hidden md:flex items-center justify-center absolute -right-3 top-1/2 h-6 w-6 rounded-full bg-primary text-white shadow-md hover:bg-primary/90 transition-colors z-50"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
          </button>
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col bg-layer transition-all duration-300 ease-in-out min-h-screen w-full",
        )}>
          <header className="sticky top-0 z-20 border-b border-strong bg-glass backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-5 md:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.history.back()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-layer text-secondary hover:text-primary transition-colors"
                  aria-label="Go back"
                >
                  <FiChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold text-primary">{activeNav}</h2>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary">
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-full bg-layer px-3 py-2 text-xs font-semibold text-secondary shadow-soft/40 hover:text-primary transition-colors"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                  <span className="hidden md:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
                <div className="hidden md:flex items-center gap-4">
                  <div className="h-10 w-px bg-border" aria-hidden />
                  <div className="text-right">
                    <p className="font-medium text-primary">{user?.name ?? 'User'}</p>
                    <p className="text-xs text-secondary">{user?.email ?? 'user@example.com'}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
              <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
};


export default UserLayout