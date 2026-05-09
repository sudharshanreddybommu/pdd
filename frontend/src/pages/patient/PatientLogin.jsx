import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendOtp, verifyOtp, checkPatientEmail, patientRegister, patientLogin } from '../../services/api'

const STEPS = ['Email', 'OTP', 'Password']

export default function PatientLogin() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const otpRefs = useRef([])

  const handleEmailSubmit = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const { data } = await checkPatientEmail(email)
      if (data.exists && data.has_password) {
        // Returning user – skip OTP, go straight to password
        setIsNew(false)
        setStep(2)
      } else {
        // New user or no password yet – send OTP
        setIsNew(!data.exists || !data.has_password)
        const res = await sendOtp(email, 'patient')
        if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
        toast.success('OTP sent to your email!')
        setStep(1)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to check email')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
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
      toast.success('OTP verified!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async e => {
    e.preventDefault()
    if (!password) return toast.error('Enter a password')
    if (isNew && password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      let res
      if (isNew) {
        res = await patientRegister(email, password)
        localStorage.setItem('patientToken', res.data.token)
        localStorage.setItem('patientUser', JSON.stringify(res.data.patient))
        toast.success('Account created!')
        navigate('/patient/profile')
      } else {
        res = await patientLogin(email, password)
        localStorage.setItem('patientToken', res.data.token)
        localStorage.setItem('patientUser', JSON.stringify(res.data.patient))
        toast.success('Welcome back!')
        navigate(res.data.patient?.name ? '/patient/home' : '/patient/profile')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">🦷</div>
          <div className="auth-logo-text">OPMD <span>AI</span></div>
        </div>
        <h1 className="auth-hero-title">Early Detection<br />Saves <span>Lives</span></h1>
        <p className="auth-hero-desc">
          AI-powered oral cancer screening at your fingertips. Upload images, get instant analysis, and connect with specialists — all in one secure platform.
        </p>
        <div className="auth-features">
          {[['🤖','AI-Powered Analysis','Instant OPMD detection from oral images'],
            ['🔒','Secure & Private','Your health data is encrypted and protected'],
            ['👨‍⚕️','Doctor Connect','Schedule consultations with verified specialists'],
            ['📱','Easy to Use','Simple 3-step scan process from any device']
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
            <div className="auth-logo-icon" style={{width:40,height:40,fontSize:20}}>🦷</div>
            <span style={{fontWeight:700,fontSize:18}}>Patient Portal</span>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator mb-3">
            {STEPS.map((s, i) => (
              <div className="step" key={s} style={{flex:1}}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{flex:1}} />}
              </div>
            ))}
          </div>

          {devOtp && (
            <div className="alert alert-warning mb-2">
              <span>⚠️</span> Dev mode OTP: <strong>{devOtp}</strong>
            </div>
          )}

          {/* Step 0: Email */}
          {step === 0 && (
            <form onSubmit={handleEmailSubmit}>
              <h2 className="auth-title">Welcome</h2>
              <p className="auth-subtitle">Enter your email to get started or sign in</p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Continue →'}
              </button>
              <p className="text-center mt-3" style={{fontSize:13,color:'var(--text-muted)'}}>
                Are you a doctor?{' '}
                <Link to="/doctor" style={{color:'var(--primary)'}}>Doctor Portal</Link>
              </p>
            </form>
          )}

          {/* Step 1: OTP */}
          {step === 1 && (
            <form onSubmit={handleOtpSubmit}>
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    className="otp-input" type="text" inputMode="numeric"
                    value={d} onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)} />
                ))}
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Verify OTP'}
              </button>
              <p className="text-center mt-2" style={{fontSize:13}}>
                <span className="text-muted">Didn't receive? </span>
                <button type="button" className="btn btn-secondary btn-sm"
                  onClick={() => { sendOtp(email,'patient').then(r => { if(r.data.dev_otp) setDevOtp(r.data.dev_otp); toast.success('OTP resent!') }) }}>
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="auth-title">{isNew ? 'Create Password' : 'Enter Password'}</h2>
              <p className="auth-subtitle">{isNew ? 'Set a secure password for your account' : `Welcome back, ${email}`}</p>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} autoFocus />
              </div>
              {isNew && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-control" type="password" placeholder="••••••••"
                    value={confirm} onChange={e => setConfirm(e.target.value)} />
                </div>
              )}
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : isNew ? 'Create Account' : 'Sign In'}
              </button>
              {!isNew && (
                <p className="text-center mt-2" style={{fontSize:13,color:'var(--text-muted)'}}>
                  <button type="button" style={{background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:13}}
                    onClick={() => { setStep(0); setPassword('') }}>← Back</button>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
