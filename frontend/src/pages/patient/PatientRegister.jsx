import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendVerificationLink, checkEmailVerificationStatus, checkPatientEmail, patientRegister, sendOtp, verifyOtp } from '../../services/api'

const STEPS = ['Email', 'Email Link Verification', 'Account Details']

export default function PatientRegister() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingForVerification, setWaitingForVerification] = useState(false)

  // OTP Fallback Option
  const [useOtpFallback, setUseOtpFallback] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  // Check URL query parameters if returning from email link click
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlVerified = searchParams.get('verified')
    if (urlEmail && urlVerified === 'true') {
      setEmail(urlEmail)
      setStep(2)
      toast.success('Email verified successfully! Complete your account details below.')
    }
  }, [searchParams])

  // Background polling for Email Verification Status
  useEffect(() => {
    let interval
    if (waitingForVerification && email && step === 1) {
      interval = setInterval(async () => {
        try {
          const res = await checkEmailVerificationStatus(email)
          if (res.data?.verified) {
            toast.success('🎉 Email verified from your email inbox! Proceeding...')
            setWaitingForVerification(false)
            setStep(2)
          }
        } catch (err) {
          console.log('Polling check note:', err)
        }
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [waitingForVerification, email, step])

  // Step 1: Send Verification Link to Email
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

      await sendVerificationLink(email.trim(), 'patient')
      toast.success('✉️ Verification link sent to your email! Please check your Gmail inbox / spam folder and click the link.')
      setWaitingForVerification(true)
      setStep(1)
    } catch (err) {
      console.error('Registration Error:', err)
      toast.error(err.response?.data?.error || 'Failed to send verification link')
    } finally {
      setLoading(false)
    }
  }

  // Switch to OTP fallback if requested
  const handleSwitchToOtp = async () => {
    setLoading(true)
    try {
      await sendOtp(email, 'patient')
      setUseOtpFallback(true)
      toast.success('6-digit OTP sent to your email address!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

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
      toast.error(err.response?.data?.error || 'Invalid OTP code')
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
        age: age ? parseInt(age) : null
      })
      
      const token = res.data.access_token || res.data.token
      localStorage.setItem('patientToken', token)
      localStorage.setItem('patientUser', JSON.stringify({
        email,
        name: name.trim(),
        phone: phone.trim(),
        age: age ? parseInt(age) : null
      }))
      toast.success('Patient account created successfully!')
      navigate('/patient/home')
    } catch (err) {
      console.error('Final Registration Error:', err)
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page fade-in">
      <div className="auth-card" style={{ maxWidth: 500, width: '100%' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, position: 'relative' }}>
          {STEPS.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= idx ? 'var(--primary)' : 'var(--surface-2)',
                color: step >= idx ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 14, border: '2px solid var(--border)'
              }}>
                {idx + 1}
              </div>
              <span style={{ fontSize: 11, marginTop: 4, color: step >= idx ? 'var(--text)' : 'var(--text-muted)', fontWeight: 600 }}>{s}</span>
            </div>
          ))}
        </div>

        {/* STEP 0: Email Input */}
        {step === 0 && (
          <form onSubmit={handleEmailSubmit}>
            <h2 className="auth-title">Create Patient Account</h2>
            <p className="auth-subtitle">Enter your email address to receive a verification link</p>

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
              {loading ? <div className="spinner" /> : '✉️ Send Verification Email Link →'}
            </button>
          </form>
        )}

        {/* STEP 1: Waiting for Email Verification Link Click */}
        {step === 1 && !useOtpFallback && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📩</div>
            <h2 className="auth-title">Check Your Email Inbox</h2>
            <p className="auth-subtitle">
              We sent a verification link to <strong style="color:var(--primary);">{email}</strong>.<br />
              Please open your <strong>Gmail Inbox / Spam folder</strong> and click <strong>"Verify Email"</strong>.
            </p>

            <div style={{
              background: 'var(--surface-2)', padding: 16, borderRadius: 12, border: '1px dashed var(--primary)',
              marginBottom: 20, fontSize: 13, color: 'var(--text-muted)'
            }}>
              ⏳ Waiting for email link click... This screen will automatically update as soon as you click the link in your email!
            </div>

            <div className="spinner" style={{ margin: '0 auto 20px' }} />

            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={handleSwitchToOtp}
              disabled={loading}
            >
              🔢 Prefer entering 6-Digit OTP Code instead? Click Here
            </button>

            <button
              type="button"
              className="btn btn-link btn-block mt-2"
              onClick={() => setStep(0)}
            >
              ← Change Email Address
            </button>
          </div>
        )}

        {/* STEP 1 (Fallback): Enter 6-Digit OTP */}
        {step === 1 && useOtpFallback && (
          <form onSubmit={handleOtpSubmit}>
            <h2 className="auth-title">Enter 6-Digit OTP</h2>
            <p className="auth-subtitle">Enter the code sent to <strong>{email}</strong></p>

            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="e.g. 123456"
                value={otp.join('')}
                onChange={e => setOtp(e.target.value.split('').slice(0, 6))}
                autoFocus
                required
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <div className="spinner" /> : '✓ Verify OTP Code →'}
            </button>
          </form>
        )}

        {/* STEP 2: Password & Account Details */}
        {step === 2 && (
          <form onSubmit={handleRegisterSubmit}>
            <h2 className="auth-title">Complete Account Details</h2>
            <p className="auth-subtitle">Email verified! Create your password and profile details.</p>

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
              <label className="form-label">Phone Number *</label>
              <input
                className="form-control"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                className="form-control"
                type="number"
                placeholder="30"
                value={age}
                onChange={e => setAge(e.target.value)}
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                className="form-control"
                type="password"
                placeholder="Repeat password"
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

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have a patient account? </span>
          <Link to="/patient/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}
