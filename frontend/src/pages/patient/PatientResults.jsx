import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../components/PatientNavbar'

const RISK_CONFIG = {
  low: {
    icon: '✅', color: '#22c55e', label: 'Low Risk', gradClass: 'result-low',
    title: 'Oral Health Looks Good!',
    message: 'No significant lesions detected. Maintain your current oral hygiene routine.',
    bgColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)',
  },
  moderate: {
    icon: '⚠️', color: '#f59e0b', label: 'Moderate Risk', gradClass: 'result-moderate',
    title: 'Early Changes Detected',
    message: 'Some oral changes found. Visit a dentist within 2 weeks for a proper evaluation.',
    bgColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)',
  },
  high: {
    icon: '🚨', color: '#ef4444', label: 'High Risk – Urgent', gradClass: 'result-high',
    title: 'Immediate Consultation Required',
    message: 'High-risk indicators detected. Please consult an oral specialist immediately without delay.',
    bgColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)',
  },
}

export default function PatientResults() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)

  useEffect(() => {
    const data = sessionStorage.getItem('scanResult')
    if (!data) navigate('/patient/scan')
    else setResult(JSON.parse(data))
  }, [navigate])

  if (!result) return null

  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low
  const isHighRisk = result.risk_level === 'high'
  const isModerate = result.risk_level === 'moderate'

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ maxWidth: 800, paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">📊 Analysis Results</h1>
          <p className="page-header-sub">AI-powered assessment of your oral cavity scan</p>
        </div>

        {/* Result Header Card */}
        <div className="card mb-3" style={{ background: cfg.bgColor, border: `1px solid ${cfg.borderColor}`, textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{cfg.icon}</div>
          <div className={`risk-badge risk-${result.risk_level}`} style={{ margin: '0 auto 16px', fontSize: 15, padding: '8px 20px' }}>
            {cfg.label}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>{cfg.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500, margin: '0 auto 20px', lineHeight: 1.7 }}>{cfg.message}</p>
          <div style={{ display: 'inline-flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color }}>{result.confidence}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence Score</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>AI</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analyzed by OPMD Model</div>
            </div>
          </div>
        </div>

        {/* Prediction */}
        <div className="card mb-3">
          <h3 className="card-title mb-2">🔬 AI Prediction</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7 }}>{result.prediction}</p>
        </div>

        {/* Suggestions */}
        <div className="card mb-3">
          <h3 className="card-title">💡 {isHighRisk ? 'Urgent Actions' : 'Recommendations'}</h3>
          <p className="card-subtitle">{isHighRisk ? 'Follow these steps immediately' : 'Follow these tips to maintain oral health'}</p>
          <ul className="suggestions-list">
            {(result.suggestions || []).map((s, i) => (
              <li key={i} className="suggestion-item">
                <div className="suggestion-dot" style={{ background: cfg.color }} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Urgent CTA */}
        {(isHighRisk || isModerate) && (
          <div className="card mb-3" style={{
            background: isHighRisk ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
            textAlign: 'center', padding: 36
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{isHighRisk ? '🏥' : '👨‍⚕️'}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {isHighRisk ? 'Consult a Doctor Immediately' : 'Book a Doctor Consultation'}
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: 14 }}>
              {isHighRisk
                ? 'Do not delay. Connect with a verified specialist now for immediate evaluation.'
                : 'Schedule a consultation with one of our verified oral health specialists.'}
            </p>
            <button onClick={() => navigate('/patient/doctors')} className="btn btn-danger btn-lg">
              🏥 View Available Doctors
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="alert alert-info">
          <span>ℹ️</span>
          <span>This AI analysis is for screening purposes only and does not replace professional medical diagnosis. Always consult a qualified healthcare provider.</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
          <button onClick={() => navigate('/patient/scan')} className="btn btn-secondary">
            🔄 New Scan
          </button>
          <button onClick={() => navigate('/patient/home')} className="btn btn-secondary">
            🏠 Home
          </button>
          {(isHighRisk || isModerate) && (
            <button onClick={() => navigate('/patient/doctors')} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
              👨‍⚕️ Find Doctors →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
