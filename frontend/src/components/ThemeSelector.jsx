import { useState, useEffect, useRef } from 'react'

const THEMES = [
  { id: 'classic', name: 'Classic Dark', icon: '🌌', primary: '#0ea5e9' },
  { id: 'emerald', name: 'Emerald Health', icon: '🌿', primary: '#10b981' },
  { id: 'light', name: 'Nordic Light', icon: '☀️', primary: '#2563eb' },
  { id: 'cyberpunk', name: 'Violet Orchid', icon: '🔮', primary: '#d946ef' }
]

export default function ThemeSelector() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'classic')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Apply theme on state change
    if (theme === 'classic') {
      document.body.removeAttribute('data-theme')
    } else {
      document.body.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Handle clicking outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0]

  return (
    <div className="theme-selector-container" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)} 
        className="theme-selector-btn"
        aria-expanded={isOpen}
      >
        <span className="theme-icon">{currentThemeObj.icon}</span>
        <span className="theme-name">{currentThemeObj.name}</span>
        <span className="theme-arrow">▼</span>
      </button>

      {isOpen && (
        <ul className="theme-dropdown-menu">
          {THEMES.map(t => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setTheme(t.id)
                  setIsOpen(false)
                }}
                className={`theme-dropdown-item ${t.id === theme ? 'active' : ''}`}
              >
                <span className="item-icon">{t.icon}</span>
                <span className="item-name">{t.name}</span>
                <span 
                  className="theme-dot" 
                  style={{ backgroundColor: t.primary }} 
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
