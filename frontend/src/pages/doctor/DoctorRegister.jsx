import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendOtp, verifyOtp, doctorRegister } from '../../services/api'

const DOC_TYPES = [
  { key: 'hospital_id_doc', label: 'Hospital ID Card', icon: '🏥', required: true },
  { key: 'medical_cert_doc', label: 'Medical Certificate', icon: '📜', required: false },
  { key: 'degree_cert_doc', label: 'Degree Certificate', icon: '🎓', required: false },
]

export default function DoctorRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [docs, setDocs] = useState({ hospital_id_doc: null, medical_cert_doc: null, degree_cert_doc: null })
  const [docNames, setDocNames] = useState({})
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const otpRefs = useRef([])
  const fileRefs = useRef({})

  const handleFileUpload = (key, file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => {
      setDocs(prev => ({ ...prev, [key]: e.target.result }))
      setDocNames(prev => ({ ...prev, [key]: file.name }))
    }
    reader.readAsDataURL(file)
  }

  const handleEmailSubmit = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const res = await sendOtp(email, 'doctor')
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
      toast.success('OTP sent to your email!')
      setStep(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }
  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const handleOtpSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      toast.success('Email verified!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleDocSubmit = async e => {
    e.preventDefault()
    if (!docs.hospital_id_doc) return toast.error('Hospital ID Card is required')
    setLoading(true)
    try {
      await doctorRegister({ email, ...docs })
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="page flex-center" style={{ minHeight: '100vh' }}>
      <div className="auth-card" style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Documents Submitted!</h2>
        <p className="text-muted mb-3" style={{ lineHeight: 1.7 }}>
          Your registration is under review. Our admin team will verify your documents within <strong>24-48 hours</strong>. You'll receive an email once approved.
        </p>
        <div className="alert alert-info mb-3"><span>📧</span><span>Check your email at <strong>{email}</strong> for verification updates</span></div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/doctor/login')} className="btn btn-primary">Go to Login</button>
          <button onClick={() => navigate('/doctor')} className="btn btn-secondary">Back to Home</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo"><div className="auth-logo-icon">🦷</div><div className="auth-logo-text">OPMD <span>AI</span></div></div>
        <h1 className="auth-hero-title">Join Our<br /><span>Medical</span><br />Network</h1>
        <p className="auth-hero-desc">Register as a verified oral health specialist and help patients detect OPMDs early through AI-assisted diagnosis.</p>
        <div className="auth-features">
          {[['📋','Required Documents','Hospital ID, Medical Certificate, Degree Certificate'],
            ['⏱️','Fast Verification','Admin review within 24-48 hours'],
            ['🔐','Secure Platform','Your data is encrypted and private'],
            ['👥','Growing Network','Connect with patients who need your expertise']
          ].map(([icon, title, desc]) => (
            <div className="auth-feature" key={title}>
              <div className="auth-feature-icon">{icon}</div>
              <div><strong style={{color:'var(--text)'}}>{title}</strong><br /><span style={{fontSize:13}}>{desc}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card fade-in">
          <div className="auth-logo mb-2">
            <div className="auth-logo-icon" style={{width:40,height:40,fontSize:20}}>👨‍⚕️</div>
            <span style={{fontWeight:700,fontSize:18}}>Doctor Registration</span>
          </div>

          {/* Steps */}
          <div className="step-indicator mb-3">
            {['Email', 'Verify OTP', 'Documents'].map((s, i) => (
              <div className="step" key={s} style={{flex:1}}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>{i < step ? '✓' : i + 1}</div>
                {i < 2 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{flex:1}} />}
              </div>
            ))}
          </div>

          {devOtp && <div className="alert alert-warning mb-2"><span>⚠️</span> Dev OTP: <strong>{devOtp}</strong></div>}

          {step === 0 && (
            <form onSubmit={handleEmailSubmit}>
              <h2 className="auth-title">Enter Email</h2>
              <p className="auth-subtitle">Use your professional/hospital email address</p>
              <div className="form-group">
                <label className="form-label">Professional Email</label>
                <input className="form-control" type="email" placeholder="doctor@hospital.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Send OTP →'}
              </button>
              <p className="text-center mt-2" style={{fontSize:13}}><Link to="/doctor" style={{color:'var(--primary)'}}>← Back to Landing Page</Link></p>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleOtpSubmit}>
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">Enter the OTP sent to <strong>{email}</strong></p>
              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el} className="otp-input" type="text" inputMode="numeric"
                    value={d} onChange={e => handleOtpChange(e.target.value, i)} onKeyDown={e => handleOtpKey(e, i)} />
                ))}
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleDocSubmit}>
              <h2 className="auth-title">Upload Documents</h2>
              <p className="auth-subtitle">Upload verification documents for admin review</p>
              {DOC_TYPES.map(dt => (
                <div key={dt.key} className="form-group">
                  <label className="form-label">{dt.icon} {dt.label} {dt.required && <span style={{color:'var(--danger)'}}>*</span>}</label>
                  <div onClick={() => fileRefs.current[dt.key]?.click()}
                    style={{padding:'14px 16px',background:'rgba(255,255,255,0.05)',border:`1px solid ${docs[dt.key] ? 'var(--primary)' : 'var(--glass-border)'}`,borderRadius:'var(--radius-sm)',cursor:'pointer',display:'flex',alignItems:'center',gap:10,transition:'all 0.2s'}}>
                    <span style={{fontSize:20}}>{docs[dt.key] ? '✅' : '📁'}</span>
                    <span style={{fontSize:14,color:docs[dt.key] ? 'var(--text)' : 'var(--text-muted)'}}>
                      {docNames[dt.key] || 'Click to upload file'}
                    </span>
                  </div>
                  <input ref={el => fileRefs.current[dt.key] = el} type="file" accept="image/*,.pdf" style={{display:'none'}}
                    onChange={e => handleFileUpload(dt.key, e.target.files[0])} />
                </div>
              ))}
              <div className="alert alert-info mb-3"><span>ℹ️</span><span>Accepted: Images (JPG, PNG) and PDF files</span></div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : '📤 Submit for Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
