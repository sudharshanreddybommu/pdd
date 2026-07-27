import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendOtp, verifyOtp, checkPatientEmail, patientRegister } from '../../services/api'

const STEPS = ['Email', 'OTP Verification', 'Account Details']

export default function PatientRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtp, setDevOtp] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [resendTimer])

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (!email) return toast.error('Email address is missing')
    setLoading(true)
    try {
      const res = await sendOtp(email, 'patient')
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
      setOtp(['', '', '', '', '', ''])
      toast.success('New OTP code sent to your email!')
      setResendTimer(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Send OTP to Email
  const handleEmailSubmit = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address (e.g. name@gmail.com)')
    }
    setLoading(true)
    try {
      const { data } = await checkPatientEmail(email.trim())
      if (data.exists && data.has_password) {
        toast.info('An account with this email already exists. Please login instead.')
        navigate('/patient/login')
        return
      }
      const res = await sendOtp(email.trim(), 'patient')
      if (res.data?.dev_otp) {
        setDevOtp(res.data.dev_otp)
      }
      toast.success('OTP code sent! Check your email inbox or screen alert.')
      setStep(1)
    } catch (err) {
      console.error('Registration Error:', err)
      const msg = err.response?.data?.error || 
        (err.code === 'ECONNABORTED' || err.message?.includes('timeout') ? 'Server is waking up. Please try again in 5 seconds.' : 
        err.message === 'Network Error' ? 'Connecting to server... Please try again in a moment.' : 'Failed to send OTP')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // OTP Input Handlers
  const handleOtpChange = (val, idx) => {
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  // Step 2: Verify OTP
  const handleOtpSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter full 6-digit OTP code')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      toast.success('Email verified successfully!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Complete Patient Registration
  const handleRegisterSubmit = async e => {
    e.preventDefault()
    if (!password) return toast.error('Please enter a password')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const res = await patientRegister({
        email,
        password,
        name: name.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age, 10) : null
      })
      localStorage.setItem('patientToken', res.data.token)
      localStorage.setItem('patientUser', JSON.stringify(res.data.patient))
      toast.success('Registration successful! Welcome to OralScan AI.')
      navigate('/patient/home')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Hero Left Side */}
      <div className="auth-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">🦷</div>
          <div className="auth-logo-text">OPMD <span>AI</span></div>
        </div>
        <h1 className="auth-hero-title">Patient<br /><span>Registration</span></h1>
        <p className="auth-hero-desc">
          Create your patient account to perform instant AI oral cavity scans, track health reports, and consult top oral oncologists and dentists.
        </p>
        <div className="auth-features">
          {[
            ['📋', 'Personalized Profile', 'Store your scan history and health profile securely'],
            ['🤖', 'AI Early Screening', 'Scan left, front, & right views with instant OPMD reports'],
            ['📄', 'Printable Reports', 'Generate official downloadable medical screening reports'],
            ['👨‍⚕️', 'Specialist Consultations', 'Book appointments directly with verified doctors']
          ].map(([icon, title, desc]) => (
            <div className="auth-feature" key={title}>
              <div className="auth-feature-icon">{icon}</div>
              <div>
                <strong style={{ color: 'var(--text)' }}>{title}</strong>
                <br />
                <span style={{ fontSize: 13 }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Form Right Side */}
      <div className="auth-right">
        <div className="auth-card fade-in">
          {/* Top Login / Register Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-2)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
            border: '1px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => navigate('/patient/login')}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 8,
                background: 'transparent',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔑 Patient Login
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 8,
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'default',
                boxShadow: '0 2px 10px rgba(14,165,233,0.3)'
              }}
            >
              📝 Patient Register
            </button>
          </div>

          <div className="auth-logo mb-2">
            <div className="auth-logo-icon" style={{ width: 40, height: 40, fontSize: 20 }}>🦷</div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Patient Registration</span>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator mb-3">
            {STEPS.map((s, i) => (
              <div className="step" key={s} style={{ flex: 1 }}>
                <div className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`step-line ${i < step ? 'done' : ''}`} style={{ flex: 1 }} />}
              </div>
            ))}
          </div>



          {/* Step 0: Enter Email */}
          {step === 0 && (
            <form onSubmit={handleEmailSubmit}>
              <h2 className="auth-title">Create Patient Account</h2>
              <p className="auth-subtitle">Enter your email address to receive an OTP verification code</p>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Send OTP Code →'}
              </button>
              <p className="text-center mt-3" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Already registered?{' '}
                <Link to="/patient/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Login Here
                </Link>
              </p>
            </form>
          )}

          {/* Step 1: Verify OTP */}
          {step === 1 && (
            <form onSubmit={handleOtpSubmit}>
              <h2 className="auth-title">Verify Email Address</h2>
              <p className="auth-subtitle">Enter the 6-digit OTP code sent to <strong>{email}</strong></p>

              {devOtp && (
                <div style={{
                  background: 'rgba(14,165,233,0.12)',
                  border: '1px solid var(--primary)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: 13, color: 'var(--primary-light)', display: 'block', marginBottom: 4 }}>
                    🔑 Verification Code (Instant Delivery):
                  </span>
                  <strong style={{ fontSize: 24, letterSpacing: 6, color: 'var(--primary)', fontFamily: 'monospace' }}>
                    {devOtp}
                  </strong>
                </div>
              )}
              <div className="otp-inputs">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                  />
                ))}
              </div>
              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Verify OTP'}
              </button>
              <p className="text-center mt-2" style={{ fontSize: 13 }}>
                <span className="text-muted">Didn't receive code? </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={loading || resendTimer > 0}
                  onClick={handleResendOtp}
                  style={{ fontWeight: 600 }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : '🔄 Resend OTP'}
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Patient Registration Details Form */}
          {step === 2 && (
            <form onSubmit={handleRegisterSubmit}>
              <h2 className="auth-title">Complete Registration</h2>
              <p className="auth-subtitle">Enter your profile details to create your patient account</p>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-control"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="e.g. 35"
                    min="1"
                    max="120"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Create Patient Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
