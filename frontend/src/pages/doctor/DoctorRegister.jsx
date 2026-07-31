import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { doctorRegister, sendOtp, verifyOtp } from '../../services/api'

const DOC_TYPES = [
  { key: 'profile_image', label: 'Professional Profile Photo', icon: '👤', required: true },
  { key: 'hospital_id_doc', label: 'Hospital ID Card', icon: '🏥', required: true },
  { key: 'medical_cert_doc', label: 'Medical Certificate', icon: '📜', required: false },
  { key: 'degree_cert_doc', label: 'Degree Certificate', icon: '🎓', required: false },
]

export default function DoctorRegister() {
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [docs, setDocs] = useState({ profile_image: null, hospital_id_doc: null, medical_cert_doc: null, degree_cert_doc: null, payment_qr: null })
  const [docNames, setDocNames] = useState({})
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fee, setFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

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

  // Step 0: Send 6-Digit Doctor OTP
  const handleEmailSubmit = async e => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email.trim())) {
      return toast.error('Please enter a valid email address (e.g. doctor@hospital.com)')
    }
    setLoading(true)
    try {
      await sendOtp(email.trim(), 'doctor')
      toast.success('✉️ 6-digit OTP code sent to your professional email!')
      setStep(1)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true)
    try {
      await sendOtp(email.trim(), 'doctor')
      toast.success('✉️ Fresh 6-digit OTP code sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: Verify 6-Digit Doctor OTP
  const handleOtpSubmit = async e => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return toast.error('Enter all 6 digits')
    setLoading(true)
    try {
      await verifyOtp(email, code)
      toast.success('🎉 Doctor email verified successfully!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Complete Doctor Registration
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
              <p className="auth-subtitle">Enter your medical email to receive a 6-digit OTP code</p>
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
              {loading ? <div className="spinner" /> : '✉️ Send 6-Digit OTP Code →'}
            </button>
          </form>
        )}

        {/* STEP 1: Enter 6-Digit Doctor OTP */}
        {step === 1 && (
          <div style={{ textAlign: 'center', padding: '5px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>📩</div>
            <h2 className="auth-title">Verify Doctor OTP Code</h2>
            <p className="auth-subtitle" style={{ marginBottom: 20 }}>
              Sent 6-digit verification code to <strong style={{ color: 'var(--primary)' }}>{email}</strong>
            </p>

            <form onSubmit={handleOtpSubmit} style={{
              background: 'var(--surface-2)', padding: 20, borderRadius: 16, border: '1px solid var(--border)',
              textAlign: 'left', marginBottom: 16
            }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`doctor-otp-input-${idx}`}
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
                        const nextEl = document.getElementById(`doctor-otp-input-${idx + 1}`)
                        if (nextEl) nextEl.focus()
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                        const prevEl = document.getElementById(`doctor-otp-input-${idx - 1}`)
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
                {loading ? <div className="spinner" /> : '✓ Verify Doctor OTP & Continue →'}
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
                🔄 Resend Doctor OTP
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
