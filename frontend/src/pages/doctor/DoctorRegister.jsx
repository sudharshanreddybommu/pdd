import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { sendVerificationLink, checkEmailVerificationStatus, doctorRegister, sendOtp, verifyOtp } from '../../services/api'

const DOC_TYPES = [
  { key: 'profile_image', label: 'Professional Profile Photo', icon: '👤', required: true },
  { key: 'hospital_id_doc', label: 'Hospital ID Card', icon: '🏥', required: true },
  { key: 'medical_cert_doc', label: 'Medical Certificate', icon: '📜', required: false },
  { key: 'degree_cert_doc', label: 'Degree Certificate', icon: '🎓', required: false },
]

export default function DoctorRegister() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [docs, setDocs] = useState({ profile_image: null, hospital_id_doc: null, medical_cert_doc: null, degree_cert_doc: null, payment_qr: null })
  const [docNames, setDocNames] = useState({})
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fee, setFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingForVerification, setWaitingForVerification] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // OTP Fallback
  const [useOtpFallback, setUseOtpFallback] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const fileRefs = useRef({})

  // Check URL query parameters if returning from email link click
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlVerified = searchParams.get('verified')
    if (urlEmail && urlVerified === 'true') {
      setEmail(urlEmail)
      setStep(2)
      toast.success('Doctor email verified successfully! Upload documents below.')
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
            toast.success('🎉 Doctor email verified! Proceeding...')
            setWaitingForVerification(false)
            setStep(2)
          }
        } catch (err) {
          console.log('Polling note:', err)
        }
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [waitingForVerification, email, step])

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
    if (!email) return toast.error('Enter your email address')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address (e.g. doctor@hospital.com)')
    }
    setLoading(true)
    try {
      await sendVerificationLink(email.trim(), 'doctor')
      toast.success('✉️ Verification link sent to your email! Please check your Gmail inbox / spam folder.')
      setWaitingForVerification(true)
      setStep(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send verification link')
    } finally {
      setLoading(false)
    }
  }

  const handleSwitchToOtp = async () => {
    setLoading(true)
    try {
      await sendOtp(email, 'doctor')
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
    if (!docs.profile_image) return toast.error('Profile Photo is required')
    if (!docs.hospital_id_doc) return toast.error('Hospital ID Card is required')
    if (!password) return toast.error('Please set a password')
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await doctorRegister({ email, password, consultation_fee: fee, ...docs })
      setSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
        <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center', padding: '40px 30px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Registration Pending Approval</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Your doctor application has been submitted successfully with all credentials. Our admin medical verification team will review your certificates within 24 hours.
          </p>
          <button onClick={() => navigate('/doctor/login')} className="btn btn-primary btn-block btn-lg" style={{ borderRadius: 30 }}>
            Go to Doctor Login →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page fade-in">
      <div className="auth-card" style={{ maxWidth: 520, width: '100%' }}>
        {/* STEP 0: Email Input */}
        {step === 0 && (
          <form onSubmit={handleEmailSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 40 }}>🩺</span>
              <h2 className="auth-title" style={{ marginTop: 8 }}>Doctor Registration</h2>
              <p className="auth-subtitle">Enter your medical email to receive a verification link</p>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Email *</label>
              <input
                className="form-control"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                required
              />
            </div>

            <button className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <div className="spinner" /> : '✉️ Send Doctor Verification Link →'}
            </button>
          </form>
        )}

        {/* STEP 1: Waiting for Link Click */}
        {step === 1 && !useOtpFallback && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📩</div>
            <h2 className="auth-title">Check Doctor Email Inbox</h2>
            <p className="auth-subtitle">
              Sent verification link to <strong style="color:var(--primary);">{email}</strong>.<br />
              Open your <strong>Gmail Inbox / Spam folder</strong> and click <strong>"Verify Email"</strong>.
            </p>

            <div style={{
              background: 'var(--surface-2)', padding: 16, borderRadius: 12, border: '1px dashed var(--primary)',
              marginBottom: 20, fontSize: 13, color: 'var(--text-muted)'
            }}>
              ⏳ Waiting for email link click... This screen will automatically update as soon as you click the link!
            </div>

            <div className="spinner" style={{ margin: '0 auto 20px' }} />

            <button type="button" className="btn btn-secondary btn-block" onClick={handleSwitchToOtp} disabled={loading}>
              🔢 Prefer entering 6-Digit OTP Code instead? Click Here
            </button>
          </div>
        )}

        {/* STEP 1 (Fallback): Enter 6-Digit OTP */}
        {step === 1 && useOtpFallback && (
          <form onSubmit={handleOtpSubmit}>
            <h2 className="auth-title">Enter 6-Digit Doctor OTP</h2>
            <p className="auth-subtitle">Enter code sent to <strong>{email}</strong></p>

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
              {loading ? <div className="spinner" /> : '✓ Verify Doctor OTP →'}
            </button>
          </form>
        )}

        {/* STEP 2: Doctor Documents & Password */}
        {step === 2 && (
          <form onSubmit={handleDocSubmit}>
            <h2 className="auth-title">Doctor Credentials & Profile</h2>
            <p className="auth-subtitle">Upload required medical certificates and set your password.</p>

            <div className="form-group">
              <label className="form-label">Consultation Fee (₹) *</label>
              <input
                className="form-control"
                type="number"
                placeholder="500"
                value={fee}
                onChange={e => setFee(e.target.value)}
                required
              />
            </div>

            {DOC_TYPES.map(doc => (
              <div key={doc.key} className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">
                  {doc.icon} {doc.label} {doc.required && '*'}
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, textAlign: 'left', borderRadius: 8, padding: '10px 14px' }}
                    onClick={() => fileRefs.current[doc.key]?.click()}
                  >
                    {docNames[doc.key] ? `✓ ${docNames[doc.key]}` : `📁 Choose ${doc.label}...`}
                  </button>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={el => fileRefs.current[doc.key] = el}
                    style={{ display: 'none' }}
                    onChange={e => handleFileUpload(doc.key, e.target.files[0])}
                  />
                </div>
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Set Account Password *</label>
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
              {loading ? <div className="spinner" /> : '🚀 Submit Application for Approval →'}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
          <span style={{ color: 'var(--text-muted)' }}>Already registered as a Doctor? </span>
          <Link to="/doctor/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  )
}
