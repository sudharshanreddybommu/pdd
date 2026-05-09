import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendOtp, verifyOtp, checkDoctorEmail, doctorSetPassword, doctorLogin } from '../../services/api'

export default function DoctorLogin() {
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
      const { data } = await checkDoctorEmail(email)
      if (!data.exists) return toast.error('No registration found. Please register first.')
      if (!data.is_verified) return toast.error('Your account is pending admin verification. Please wait.')
      if (data.has_password) {
        setIsNew(false); setStep(2)
      } else {
        setIsNew(true)
        const res = await sendOtp(email, 'doctor')
        if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
        toast.success('OTP sent!')
        setStep(1)
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error checking email')
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

  const handlePasswordSubmit = async e => {
    e.preventDefault()
    if (!password) return toast.error('Enter password')
    if (isNew && password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Minimum 6 characters')
    setLoading(true)
    try {
      let res
      if (isNew) {
        res = await doctorSetPassword(email, password)
      } else {
        res = await doctorLogin(email, password)
      }
      localStorage.setItem('doctorToken', res.data.token)
      localStorage.setItem('doctorUser', JSON.stringify(res.data.doctor))
      toast.success('Welcome, Doctor!')
      navigate(res.data.doctor?.name ? '/doctor/dashboard' : '/doctor/profile')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-logo"><div className="auth-logo-icon">🦷</div><div className="auth-logo-text">OPMD <span>AI</span></div></div>
        <h1 className="auth-hero-title">Doctor<br /><span>Dashboard</span><br />Access</h1>
        <p className="auth-hero-desc">Manage patient consultations, review AI analysis, and schedule appointments from your secure medical dashboard.</p>
        <div className="auth-features">
          {[['🔒','Verified Doctors Only','Only approved medical professionals can access'],
            ['📊','AI Pre-Analysis','Review patient scan results before consultations'],
            ['📅','Appointment System','Manage and schedule patient consultations'],
            ['🔔','Real-time Alerts','Instant notifications for new patient requests']
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
            <span style={{fontWeight:700,fontSize:18}}>Doctor Login</span>
          </div>
          <div className="step-indicator mb-3">
            {['Email','OTP','Password'].map((s, i) => (
              <div className="step" key={s} style={{flex:1}}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>{i < step ? '✓' : i+1}</div>
                {i < 2 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{flex:1}} />}
              </div>
            ))}
          </div>

          {devOtp && <div className="alert alert-warning mb-2"><span>⚠️</span> Dev OTP: <strong>{devOtp}</strong></div>}

          {step === 0 && (
            <form onSubmit={handleEmailSubmit}>
              <h2 className="auth-title">Doctor Login</h2>
              <p className="auth-subtitle">Enter your registered professional email</p>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" type="email" placeholder="doctor@hospital.com"
                  value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Continue →'}
              </button>
              <p className="text-center mt-2" style={{fontSize:13}}>
                Not registered? <Link to="/doctor/register" style={{color:'var(--primary)'}}>Register Here</Link>
              </p>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleOtpSubmit}>
              <h2 className="auth-title">Verify Email</h2>
              <p className="auth-subtitle">OTP sent to <strong>{email}</strong></p>
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
            <form onSubmit={handlePasswordSubmit}>
              <h2 className="auth-title">{isNew ? 'Set Password' : 'Enter Password'}</h2>
              <p className="auth-subtitle">{isNew ? 'Create a secure password for your account' : `Welcome back, Dr. ${email}`}</p>
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
                {loading ? <div className="spinner" /> : isNew ? 'Set Password & Login' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
