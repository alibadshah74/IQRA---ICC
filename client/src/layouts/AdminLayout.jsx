import React, { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import { adminNav } from '../data/adminNav.js'
import { useAuth } from '../context/AuthContext.jsx'

const AdminLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageTitle = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const current = segments[1] || ''
    const match = adminNav.find((item) => item.path === current)
    return match ? match.label : 'Admin Dashboard'
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 lg:pl-64">
      <Sidebar
        brand="IQRA"
        navItems={adminNav}
        basePath="/admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col px-6 py-8 lg:h-screen lg:overflow-y-auto lg:px-10">
        <Topbar
          title={pageTitle}
          subtitle="Admin Panel"
          onLogout={handleLogout}
          onMenu={() => setSidebarOpen(true)}
        />

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
