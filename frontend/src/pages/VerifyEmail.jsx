import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyEmailToken } from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const userType = searchParams.get('user_type') || 'patient'

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !email) {
      setLoading(false)
      setMessage('Invalid or missing verification parameters.')
      return
    }

    verifyEmailToken(token, email)
      .then(res => {
        setSuccess(true)
        setMessage(res.data?.message || 'Email address verified successfully!')
        localStorage.setItem(`email_verified_${email.toLowerCase()}`, 'true')
      })
      .catch(err => {
        setSuccess(false)
        setMessage(err.response?.data?.error || 'Verification link expired or invalid.')
      })
      .finally(() => setLoading(false))
  }, [token, email])

  const handleProceed = () => {
    if (userType === 'doctor') {
      navigate(`/doctor/register?email=${encodeURIComponent(email)}&verified=true`)
    } else {
      navigate(`/patient/register?email=${encodeURIComponent(email)}&verified=true`)
    }
  }

  return (
    <div className="auth-page fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <div className="auth-card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: '40px 30px' }}>
        <div style={{ fontSize: 54, marginBottom: 16 }}>
          {loading ? '⏳' : success ? '🎉' : '❌'}
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
          {loading ? 'Verifying Email Address...' : success ? 'Email Verified Successfully!' : 'Verification Failed'}
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          {message}
        </p>

        {loading && <div className="spinner" style={{ margin: '0 auto' }} />}

        {!loading && success && (
          <button onClick={handleProceed} className="btn btn-primary btn-block btn-lg" style={{ borderRadius: 30, fontWeight: 800 }}>
            Continue Registration →
          </button>
        )}

        {!loading && !success && (
          <button onClick={() => navigate('/')} className="btn btn-secondary btn-block mt-2" style={{ borderRadius: 30 }}>
            Return to Home
          </button>
        )}
      </div>
    </div>
  )
}
