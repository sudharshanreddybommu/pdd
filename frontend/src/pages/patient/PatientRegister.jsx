import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { checkPatientEmail, patientRegister, sendOtp, verifyOtp } from '../../services/api'

const STEPS = ['Email', 'Verify OTP', 'Account Details']

export default function PatientRegister() {
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  // Step 0: Send 6-Digit OTP to Email
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

      await sendOtp(email.trim(), 'patient')
      toast.success('✉️ 6-digit OTP code sent to your email! Please check your inbox.')
      setStep(1)
    } catch (err) {
      console.error('OTP Send Error:', err)
      toast.error(err.response?.data?.error || 'Failed to send 6-digit OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await sendOtp(email.trim(), 'patient')
      toast.success('✉️ Fresh 6-digit OTP code sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Verify 6-Digit OTP Code
  const handleOtpSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter full 6-digit OTP code')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      toast.success('🎉 Email verified successfully!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Complete Patient Registration
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
        age: age ? parseInt(age) : null
      })
      
      toast.success('🎉 Registration successful! Welcome to OralScan AI.')
      if (res.data?.token) {
        localStorage.setItem('patientToken', res.data.token)
        localStorage.setItem('userType', 'patient')
        if (res.data.patient) {
          localStorage.setItem('patientData', JSON.stringify(res.data.patient))
        }
      }
      navigate('/patient/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🦷</div>
          <h1 className="auth-brand">OralScan AI</h1>
          <p className="auth-tagline">OPMD Early Detection Platform</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: idx <= step ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>

        {/* STEP 0: Email Input */}
        {step === 0 && (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="auth-title">Create Patient Account</h2>
            <p className="auth-subtitle">Enter your email address to receive a 6-digit OTP code</p>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <div className="spinner" /> : '✉️ Send 6-Digit OTP Code →'}
            </button>
          </form>
        )}

        {/* STEP 1: Enter 6-Digit OTP */}
        {step === 1 && (
          <div style={{ textAlign: 'center', padding: '5px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>📩</div>
            <h2 className="auth-title">Enter 6-Digit OTP Code</h2>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              We sent a 6-digit verification code to <strong style={{ color: 'var(--primary)' }}>{email}</strong>
            </p>

            <form onSubmit={handleOtpSubmit} style={{
              background: 'var(--surface-2)', padding: 20, borderRadius: 16, border: '1px solid var(--border)',
              textAlign: 'left', marginBottom: 16
            }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`patient-otp-input-${idx}`}
                    type="text"
                    maxLength="1"
                    className="form-control"
                    style={{
                      width: 44, height: 50, textAlign: 'center', fontSize: 22, fontWeight: 800,
                      borderRadius: 10, border: '2px solid var(--border)', padding: 0
                    }}
                    value={digit}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      const newOtp = [...otp]
                      newOtp[idx] = val
                      setOtp(newOtp)
                      if (val && idx < 5) {
                        const nextEl = document.getElementById(`patient-otp-input-${idx + 1}`)
                        if (nextEl) nextEl.focus()
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                        const prevEl = document.getElementById(`patient-otp-input-${idx - 1}`)
                        if (prevEl) prevEl.focus()
                      }
                    }}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || otp.join('').length < 6}
                style={{ fontWeight: 700, borderRadius: 10 }}
              >
                {loading ? <div className="spinner" /> : '✓ Verify OTP & Continue →'}
              </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '0 4px' }}>
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={handleResendOtp}
                disabled={loading}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                🔄 Resend OTP Code
              </button>

              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => setStep(0)}
                style={{ color: 'var(--text-muted)' }}
              >
                ← Change Email
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Password & Account Details */}
        {step === 2 && (
          <form onSubmit={handleRegisterSubmit}>
            <h2 className="auth-title">Create Password & Profile</h2>
            <p className="auth-subtitle">Set up your account password and personal details</p>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                className="form-control"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-control"
                type="number"
                placeholder="35"
                value={age}
                onChange={e => setAge(e.target.value)}
                min="1"
                max="120"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Create Password *</label>
              <input
                className="form-control"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                className="form-control"
                type="password"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <div className="spinner" /> : '🎉 Create Patient Account →'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-footer" style={{ marginTop: 24, textAlign: 'center' }}>
          <p>
            Already have an account?{' '}
            <Link to="/patient/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
