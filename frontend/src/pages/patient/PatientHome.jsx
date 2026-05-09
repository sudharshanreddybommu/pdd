import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../components/PatientNavbar'

const AWARENESS = [
  { icon: '🔬', title: 'What are OPMDs?', text: 'Oral Potentially Malignant Disorders are lesions or conditions of the oral mucosa that carry a risk of malignant transformation. Early detection is key to preventing oral cancer.' },
  { icon: '⚠️', title: 'Risk Factors', text: 'Tobacco use (smoking, chewing), heavy alcohol consumption, betel nut chewing, HPV infection, poor nutrition, and chronic sun exposure to lips are major risk factors.' },
  { icon: '🩺', title: 'Common Conditions', text: 'Leukoplakia (white patches), Erythroplakia (red patches), Oral Submucous Fibrosis (OSF), Oral Lichen Planus, and Actinic Cheilitis are common OPMDs.' },
  { icon: '✅', title: 'Prevention Tips', text: 'Quit tobacco and alcohol, maintain good oral hygiene, eat antioxidant-rich foods, wear lip protection in the sun, and get regular oral cancer screenings.' },
  { icon: '📸', title: 'How Our AI Works', text: 'Upload clear photos of your oral cavity from three angles. Our AI analyzes color, texture, and pattern changes to detect early signs of OPMDs with high accuracy.' },
  { icon: '🚨', title: 'Warning Signs', text: 'Red or white patches, sores that don\'t heal after 2 weeks, lumps or thickening, difficulty chewing or swallowing, and persistent mouth pain are warning signs.' },
]

const STATS = [
  { val: '95%', label: 'AI Detection Accuracy' },
  { val: '300K+', label: 'Oral Cancer Cases Yearly' },
  { val: '90%', label: 'Survival Rate if Caught Early' },
  { val: '2 min', label: 'Average Scan Time' },
]

export default function PatientHome() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('patientUser') || '{}')

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <div className="tag mb-2">🤖 AI-Powered Screening</div>
          <h1 className="hero-title">
            {user.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Protect Your'}<br />
            {user.name ? 'Ready for your oral health check?' : <><span>Oral Health</span> Today</>}
          </h1>
          <p className="hero-desc">
            Take a 2-minute oral scan and let our AI instantly detect signs of Oral Potentially Malignant Disorders. Early detection saves lives.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/patient/scan')}
              className="btn btn-primary btn-lg">
              🔍 Start Scan
            </button>
            <button onClick={() => navigate('/patient/doctors')}
              className="btn btn-secondary btn-lg">
              👨‍⚕️ Find Doctors
            </button>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-grid">
          {STATS.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-value" style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scan CTA */}
        <div className="card mt-3 mb-3" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12))', border: '1px solid rgba(14,165,233,0.2)', textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Ready for Your Oral Screening?</h2>
          <p className="text-muted mb-3">Upload 3 oral cavity photos and get AI-powered analysis in under 2 minutes</p>
          <button onClick={() => navigate('/patient/scan')} className="btn btn-primary btn-lg">
            🔍 Start Scan Now
          </button>
        </div>

        {/* Awareness */}
        <section className="section">
          <h2 className="section-title">Oral Health Awareness</h2>
          <p className="section-subtitle">Stay informed. Early knowledge leads to early action.</p>
          <div className="awareness-grid">
            {AWARENESS.map(a => (
              <div className="awareness-card" key={a.title}>
                <div className="awareness-icon">{a.icon}</div>
                <h3 className="awareness-title">{a.title}</h3>
                <p className="awareness-text">{a.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="divider" />
        <div className="text-center text-muted" style={{ padding: '24px 0', fontSize: 13 }}>
          © 2024 OPMD AI Detection Platform · For educational and screening purposes only · Always consult a licensed medical professional
        </div>
      </div>
    </div>
  )
}
