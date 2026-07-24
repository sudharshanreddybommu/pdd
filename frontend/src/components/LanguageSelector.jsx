import { useLanguage } from '../utils/i18n'

export default function LanguageSelector() {
  const { lang, changeLanguage } = useLanguage()

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 20, border: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13 }}>🌐</span>
      <button
        onClick={() => changeLanguage('en')}
        style={{
          background: lang === 'en' ? 'var(--primary)' : 'transparent',
          color: lang === 'en' ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 12,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('te')}
        style={{
          background: lang === 'te' ? 'var(--primary)' : 'transparent',
          color: lang === 'te' ? '#fff' : 'var(--text-muted)',
          border: 'none',
          borderRadius: 12,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        తెలుగు
      </button>
    </div>
  )
}
