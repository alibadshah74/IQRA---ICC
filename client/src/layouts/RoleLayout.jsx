import React, { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { roleNav } from '../data/roleNav.js'
import { useAuth } from '../context/AuthContext.jsx'

const RoleLayout = ({ role, subtitle }) => {
  const navigate = useNavigate()
  const { logout, role: activeRole } = useAuth()
  const navItems = roleNav[role] || []
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const pageTitle = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const current = segments[1] || ''
    const match = navItems.find((item) => item.path === current)
    return match ? match.label : `${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`
  }, [location.pathname, navItems, role])

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:pl-64">
      <Sidebar
        brand="IQRA"
        navItems={navItems}
        basePath={`/${role}`}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col px-6 py-8 lg:h-screen lg:overflow-y-auto lg:px-10">
        <Topbar title={pageTitle} subtitle={subtitle} onLogout={handleLogout} onMenu={() => setSidebarOpen(true)} />

        <div className="mt-4 text-xs text-slate-500">
          Signed in as {activeRole ? activeRole.toUpperCase() : 'GUEST'}
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default RoleLayout
