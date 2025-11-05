import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { FiMenu, FiSun, FiMoon } from "react-icons/fi"
import { apiService } from "../services/ApiService"
import type { ApiConfig } from "../services/ApiService"
import { useTheme } from "../hooks/useTheme"
import Sidebar from "./Sidebar"

const UserLayout = () => {
  const { isDark, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
    if (activeSegment.startsWith('profile')) return 'Profile'
    if (activeSegment.startsWith('settings')) return 'Settings'
    return 'Dashboard'
  }, [activeSegment])

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/auth/login')
  }

  return (
    <div className={`relative flex min-h-screen bg-canvas bg-aurora text-primary transition-colors duration-300`}>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-primary text-white p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        aria-label="Toggle navigation"
      >
        <FiMenu size={22} />
      </button>

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        user={user}
        isDark={isDark}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col bg-layer">
        <header className="sticky top-0 z-30 border-b border-strong bg-glass">
          <div className="flex items-center justify-between px-4 py-5 md:px-8">
            <div>
              <h2 className="text-xl font-semibold text-primary">{activeNav}</h2>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm text-secondary">
              <div className="text-right">
                <p className="font-medium text-primary">{user?.name ?? 'User'}</p>
                <p className="text-xs text-secondary">{user?.email ?? 'user@example.com'}</p>
              </div>
              <div className="h-10 w-px bg-border" aria-hidden />
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full bg-layer px-4 py-2 text-xs font-semibold text-secondary shadow-soft/40 hover:text-primary transition-colors"
              >
                {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full px-4 py-6 md:px-8 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserLayout