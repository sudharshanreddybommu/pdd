import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import ThemeSelector from './ThemeSelector'
import LanguageSelector from './LanguageSelector'

export default function DoctorNavbar({ unread = 0 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const doctor = JSON.parse(localStorage.getItem('doctorUser') || '{}')

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('doctorToken')
    localStorage.removeItem('doctorUser')
    navigate('/doctor/login')
  }
  const isActive = path => location.pathname === path ? 'nav-link active' : 'nav-link'

  const isDashboard = location.pathname === '/doctor/dashboard'

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!isDashboard && (
          <button onClick={() => navigate(-1)} className="btn-back-arrow" aria-label="Go Back" title="Go Back">
            ←
          </button>
        )}
        <Link to="/doctor/dashboard" className="navbar-brand">
          <img src="/app-logo.png" alt="OralScan Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          OPMD <span style={{ color: 'var(--primary)', marginLeft: 4 }}>AI</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>Doctor</span>
        </Link>
      </div>

      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-nav ${isOpen ? 'open' : ''}`}>
        <Link to="/doctor/dashboard" className={isActive('/doctor/dashboard')}>
          Dashboard {unread > 0 && <span className="nav-badge">{unread}</span>}
        </Link>
        <Link to="/doctor/profile" className={isActive('/doctor/profile')}>Profile</Link>
        {doctor.name && <span className="nav-doc-name">Dr. {doctor.name}</span>}
        <ThemeSelector />
        <LanguageSelector />
        <button onClick={logout} className="btn btn-secondary btn-sm nav-btn-mobile">Logout</button>
      </div>
    </nav>
  )
}
