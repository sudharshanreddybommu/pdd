import { useNavigate } from 'react-router-dom'

const FEATURES = [
  { icon: '🤖', title: 'AI-Assisted Diagnosis', desc: 'Review AI analysis of patient oral images before consultations for faster, data-driven decisions.' },
  { icon: '📸', title: 'Multi-View Image Review', desc: 'Examine left, front, and right oral cavity views submitted by patients for comprehensive assessment.' },
  { icon: '📅', title: 'Appointment Management', desc: 'Accept, schedule, and manage patient consultations all from one unified dashboard.' },
  { icon: '🔒', title: 'Verified Access Only', desc: 'Strict document verification ensures only licensed medical professionals access the platform.' },
  { icon: '🔔', title: 'Instant Notifications', desc: 'Get notified immediately when patients request consultations or submit scans.' },
  { icon: '📊', title: 'Patient Analytics', desc: 'Track patient history, risk levels, and treatment outcomes over time.' },
]

export default function DoctorLanding() {
  const navigate = useNavigate()

  return (
    <div className="page fade-in" style={{ background: 'var(--bg-dark)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-icon">🦷</div>
          OPMD <span style={{ color: 'var(--primary)', marginLeft: 4 }}>AI</span>
        </div>
        <div className="navbar-nav">
          <button onClick={() => navigate('/patient/login')} className="nav-link">Patient Portal</button>
          <button onClick={() => navigate('/doctor/login')} className="btn btn-secondary btn-sm">Doctor Login</button>
          <button onClick={() => navigate('/doctor/register')} className="btn btn-primary btn-sm">Register</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '100px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="tag mb-3" style={{ fontSize: 14 }}>🏥 Medical Professional Platform</div>
          <h1 className="hero-title">
            OPMD AI Detection<br /><span>Doctor Portal</span>
          </h1>
          <p className="hero-desc" style={{ maxWidth: 640 }}>
            Join our network of verified oral health specialists. Leverage AI-powered pre-screening to make faster, more accurate diagnoses and connect with patients who need your expertise.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/doctor/register')} className="btn btn-primary btn-lg">
              📝 Register as Doctor
            </button>
            <button onClick={() => navigate('/doctor/login')} className="btn btn-secondary btn-lg">
              🔐 Doctor Login
            </button>
          </div>
        </div>
      </div>

      {/* Verification Process */}
      <div className="container">
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08))', border: '1px solid rgba(14,165,233,0.2)', padding: 48 }}>
          <h2 className="section-title text-center mb-3">🛡️ Doctor Verification Process</h2>
          <p className="text-center text-muted mb-4" style={{ fontSize: 15 }}>
            We maintain the highest standards by verifying every doctor before granting platform access
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {[
              ['1', '📝', 'Submit Documents', 'Upload your Hospital ID, Medical Certificate, and Degree Certificate'],
              ['2', '🔍', 'Admin Review', 'Our team verifies your credentials within 24-48 hours'],
              ['3', '✅', 'Account Approved', 'Receive email confirmation and set up your password'],
              ['4', '🚀', 'Start Helping', 'Access the dashboard and begin accepting patient consultations'],
            ].map(([num, icon, title, desc]) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'var(--gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 800, fontSize: 18 }}>{num}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <section className="section">
          <h2 className="section-title text-center">Why Join Our Platform?</h2>
          <p className="section-subtitle text-center">Everything you need to provide exceptional oral health care</p>
          <div className="awareness-grid">
            {FEATURES.map(f => (
              <div className="awareness-card" key={f.title}>
                <div className="awareness-icon">{f.icon}</div>
                <h3 className="awareness-title">{f.title}</h3>
                <p className="awareness-text">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '40px 0 60px' }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 16 }}>Ready to Make a Difference?</h2>
          <p className="text-muted mb-3">Join hundreds of specialists helping patients detect oral cancer early</p>
          <button onClick={() => navigate('/doctor/register')} className="btn btn-primary btn-lg">
            Register Now →
          </button>
        </div>
        <div className="divider" />
        <div className="text-center text-muted" style={{ padding: '20px 0', fontSize: 13 }}>
          © 2024 OPMD AI Detection Platform · For licensed medical professionals only
        </div>
      </div>
    </div>
  )
}
