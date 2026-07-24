import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getNotifications, markNotificationsRead } from '../services/api'
import ThemeSelector from './ThemeSelector'
import LanguageSelector from './LanguageSelector'

export default function PatientNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('patientUser') || '{}')

  useEffect(() => {
    getNotifications().then(r => {
      setUnread(r.data.filter(n => !n.is_read).length)
    }).catch(() => {})
  }, [location.pathname])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const logout = () => {
    localStorage.removeItem('patientToken')
    localStorage.removeItem('patientUser')
    navigate('/patient/login')
  }

  const isActive = path => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar">
      <Link to="/patient/home" className="navbar-brand">
        <div className="navbar-brand-icon">🦷</div>
        OPMD <span style={{color:'var(--primary)',marginLeft:4}}>AI</span>
      </Link>
      
      <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-nav ${isOpen ? 'open' : ''}`}>
        <Link to="/patient/home" className={isActive('/patient/home')}>Home</Link>
        <Link to="/patient/scan" className={isActive('/patient/scan')}>Scan</Link>
        <Link to="/patient/doctors" className={isActive('/patient/doctors')}>Doctors</Link>
        <Link to="/patient/appointments" className={isActive('/patient/appointments')}>
          Appointments {unread > 0 && <span className="nav-badge">{unread}</span>}
        </Link>
        <Link to="/patient/profile" className={isActive('/patient/profile')}>Profile</Link>
        <ThemeSelector />
        <LanguageSelector />
        <button onClick={logout} className="btn btn-secondary btn-sm nav-btn-mobile">Logout</button>
      </div>
    </nav>
  )
}
