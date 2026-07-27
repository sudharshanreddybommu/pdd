import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendOtp, verifyOtp, checkPatientEmail, patientLogin, patientRegister } from '../../services/api'
import { sendPhoneOtp, verifyPhoneOtp } from '../../services/supabaseClient'

export default function PatientLogin() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0: Normal Login, 1: Password Reset
  const [authMethod, setAuthMethod] = useState('email') // 'email' or 'phone'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneStep, setPhoneStep] = useState(0) // 0: Send OTP, 1: Verify OTP
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [userFound, setUserFound] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])

  const handleSendPhoneOtp = async (e) => {
    e.preventDefault()
    if (!phone) return toast.error('Please enter your mobile phone number')
    setLoading(true)
    try {
      await sendPhoneOtp(phone)
      toast.success('📱 SMS OTP sent to your phone number!')
      setPhoneStep(1)
    } catch (err) {
      console.error('Phone OTP Error:', err)
      toast.error(err.message || 'Failed to send Phone SMS OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault()
    if (!phoneOtp) return toast.error('Please enter the 6-digit OTP code')
    setLoading(true)
    try {
      const data = await verifyPhoneOtp(phone, phoneOtp)
      localStorage.setItem('patientToken', data.session?.access_token || 'supabase-token')
      localStorage.setItem('patientUser', JSON.stringify({
        email: data.user?.email || `${phone}@patient.com`,
        name: `Patient (${phone})`,
        phone: phone
      }))
      toast.success('Phone verification successful! Welcome back.')
      navigate('/patient/home')
    } catch (err) {
      console.error('Verify Phone OTP Error:', err)
      toast.error(err.message || 'Invalid SMS OTP code')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [resendTimer])

  const handleResendOtp = async () => {
    if (!email) return toast.error('Email address is missing')
    setLoading(true)
    try {
      const res = await sendOtp(email, 'patient')
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
      setOtp(['', '', '', '', '', ''])
      toast.success('New reset OTP code sent to your email!')
      setResendTimer(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Check Email & Enter Password
  const handleEmailCheck = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter your registered email address')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address (e.g. name@gmail.com)')
    }
    setLoading(true)
    try {
      const { data } = await checkPatientEmail(email.trim())
      if (!data.exists) {
        toast.warning('No patient account found with this email. Please register first!')
        return
      }
      setUserFound(true)
    } catch (err) {
      console.error('Email check error:', err)
      const msg = err.response?.data?.error || 
        (err.code === 'ECONNABORTED' || err.message?.includes('timeout') ? 'Server is starting up. Please wait 5 seconds and click again.' : 
        err.message === 'Network Error' ? 'Cannot connect to server. Please try again in a moment.' : 'Failed to check account')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Handle Login with Password
  const handleLoginSubmit = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter email')
    if (!password) return toast.error('Enter password')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address (e.g. name@gmail.com)')
    }
    setLoading(true)
    try {
      const res = await patientLogin(email.trim(), password)
      localStorage.setItem('patientToken', res.data.token)
      localStorage.setItem('patientUser', JSON.stringify(res.data.patient))
      toast.success('Welcome back!')
      navigate(res.data.patient?.name ? '/patient/home' : '/patient/profile')
    } catch (err) {
      console.error('Login submit error:', err)
      const msg = err.response?.data?.error || 
        (err.code === 'ECONNABORTED' || err.message?.includes('timeout') ? 'Server is starting up. Please try again in a moment.' : 
        err.message === 'Network Error' ? 'Cannot connect to server. Please try again in a moment.' : 'Invalid email or password')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    toast.info('Testing connection to Render server...')
    try {
      const start = Date.now()
      const res = await fetch('https://oralscan-live-api.onrender.com/api/notifications', { method: 'GET', mode: 'cors' })
      const duration = Date.now() - start
      alert(`✅ Connected successfully!\n\nServer is alive.\nDuration: ${duration}ms\nStatus: ${res.status}`)
    } catch (err) {
      alert(`⚠️ Connection Failed!\n\nError Message: ${err.message}\n\nVerify that the phone has internet access and can reach: https://oralscan-live-api.onrender.com`)
    }
  }

  // Forgot Password / OTP Flow
  const handleSendResetOtp = async () => {
    if (!email) return toast.error('Enter email first')
    setLoading(true)
    try {
      const res = await sendOtp(email, 'patient')
      if (res.data.dev_otp) setDevOtp(res.data.dev_otp)
      toast.success('Reset OTP sent to your email!')
      setStep(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset OTP')
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

  const handleResetPasswordSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits of OTP')
    if (!newPassword || newPassword.length < 6) return toast.error('New password must be at least 6 characters')
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await verifyOtp(email, code)
      const res = await patientRegister(email, newPassword)
      localStorage.setItem('patientToken', res.data.token)
      localStorage.setItem('patientUser', JSON.stringify(res.data.patient))
      toast.success('Password updated & logged in successfully!')
      navigate('/patient/home')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password reset failed')
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
        <h1 className="auth-hero-title">Patient<br /><span>Portal</span> Login</h1>
        <p className="auth-hero-desc">
          Sign in to your patient account to access your AI oral cavity scan reports, appointment schedules, and medical history.
        </p>
        <div className="auth-features">
          {[
            ['🤖', 'AI-Powered Analysis', 'Instant OPMD detection from oral cavity photos'],
            ['🔒', 'Secure & Private', 'Your health data is encrypted and protected'],
            ['👨‍⚕️', 'Doctor Consultations', 'Schedule appointments with verified specialists'],
            ['📱', 'Easy to Use', 'Accessible on both desktop and mobile browsers']
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

      {/* Auth Card Right Side */}
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
              🔑 Patient Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient/register')}
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
              📝 Patient Register
            </button>
          </div>

          <div className="auth-logo mb-2">
            <div className="auth-logo-icon" style={{ width: 40, height: 40, fontSize: 20 }}>🔑</div>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Patient Sign In</span>
          </div>

          {/* Login Form: Email + Password */}
          {step === 0 && (
            <form onSubmit={handleLoginSubmit}>
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Enter your registered email address and password to sign in</p>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    setUserFound(false)
                  }}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Password</label>
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Sign In →'}
              </button>

              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
                fontSize: 14
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Don't have a patient account? </span>
                <Link to="/patient/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Register Here
                </Link>
              </div>

              <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                Are you a doctor?{' '}
                <Link to="/doctor" style={{ color: 'var(--accent, #6366f1)', fontWeight: 600 }}>
                  Doctor Portal →
                </Link>
              </div>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  📡 Test Server Connection
                </button>
              </div>
            </form>
          )}

          {/* Reset Password Step */}
          {step === 1 && (
            <form onSubmit={handleResetPasswordSubmit}>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">Enter OTP sent to <strong>{email}</strong> and set a new password</p>

              <div className="otp-inputs mb-3">
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

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-control"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <div className="spinner" /> : 'Reset Password & Sign In'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13 }}
                  onClick={() => setStep(0)}
                >
                  ← Back to Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={loading || resendTimer > 0}
                  onClick={handleResendOtp}
                  style={{ fontWeight: 600 }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : '🔄 Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
