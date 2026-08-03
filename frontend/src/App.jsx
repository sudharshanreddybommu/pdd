import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Patient Pages
import PatientLogin from './pages/patient/PatientLogin'
import PatientRegister from './pages/patient/PatientRegister'
import PatientHome from './pages/patient/PatientHome'
import PatientProfile from './pages/patient/PatientProfile'
import PatientScan from './pages/patient/PatientScan'
import PatientResults from './pages/patient/PatientResults'
import PatientDoctors from './pages/patient/PatientDoctors'
import PatientAppointments from './pages/patient/PatientAppointments'

// Doctor Pages
import DoctorLanding from './pages/doctor/DoctorLanding'
import DoctorRegister from './pages/doctor/DoctorRegister'
import DoctorLogin from './pages/doctor/DoctorLogin'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorProfile from './pages/doctor/DoctorProfile'

import VerifyEmail from './pages/VerifyEmail'

import './App.css'

import { useEffect, useState } from 'react'
import { getAppVersion } from './services/api'

const CURRENT_VERSION = '1.0.1'

const PatientPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('patientToken')
  return token ? children : <Navigate to="/patient/login" replace />
}

const DoctorPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('doctorToken')
  return token ? children : <Navigate to="/doctor/login" replace />
}

function App() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState(-1) // -1 not downloading, 0-100 progress

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'classic'
    if (savedTheme === 'classic') {
      document.body.removeAttribute('data-theme')
    } else {
      document.body.setAttribute('data-theme', savedTheme)
    }

    // Version Check
    getAppVersion()
      .then(res => {
        if (res && res.data && res.data.version !== CURRENT_VERSION) {
          const skipUpdate = sessionStorage.getItem('skip_update')
          if (!skipUpdate) {
            setUpdateInfo(res.data)
            setUpdateAvailable(true)
          }
        }
      })
      .catch(err => console.log('Version check offline/skipped', err))

    // Silent background warmup ping to cloud backend on app launch
    fetch('https://oralscan-live-api.onrender.com/api/notifications')
      .then(() => console.log('Backend server active and warm'))
      .catch(() => console.log('Warming up backend server in background...'))
  }, [])

  const startDownload = () => {
    setDownloadProgress(0)
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Random increment based on simulated net speed
        const inc = Math.floor(Math.random() * 12) + 6
        const next = prev + inc
        if (next >= 100) {
          clearInterval(interval)
          return 100
        }
        return next
      })
    }, 250)
  }

  const handleUpdateDone = () => {
    if (updateInfo?.apk_url) {
      window.open(updateInfo.apk_url, '_blank')
    }
    setUpdateAvailable(false)
    setDownloadProgress(-1)
  }

  const handleLater = () => {
    sessionStorage.setItem('skip_update', 'true')
    setUpdateAvailable(false)
    setDownloadProgress(-1)
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      
      {/* Dynamic Update Modal Alert */}
      {updateAvailable && updateInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div className="card fade-in" style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--surface)',
            color: 'var(--text)',
            borderRadius: 20,
            padding: '30px 24px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.3)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: 50, marginBottom: 16 }}>{downloadProgress === 100 ? '✅' : '🔄'}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'var(--primary)' }}>
              {downloadProgress === 100 ? 'Update Ready!' : 'New Update Available!'}
            </h3>
            
            {downloadProgress === -1 ? (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Version {updateInfo.version} is now ready for download. Get the latest features and enhancements.
                </p>
                {updateInfo.notes && (
                  <div style={{
                    background: 'var(--surface-2)',
                    padding: 12,
                    borderRadius: 10,
                    fontSize: 12,
                    textAlign: 'left',
                    marginBottom: 24,
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)'
                  }}>
                    <strong>Release Notes:</strong>
                    <p style={{ margin: '4px 0 0' }}>{updateInfo.notes}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={handleLater}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px 0', borderRadius: 12, fontWeight: 700 }}
                  >
                    Later
                  </button>
                  <button
                    onClick={startDownload}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: 12,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(14,165,233,0.35)'
                    }}
                  >
                    Update Now
                  </button>
                </div>
              </>
            ) : downloadProgress < 100 ? (
              <div style={{ padding: '10px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Downloading update packages...
                </p>
                <div style={{
                  background: 'var(--surface-2)',
                  height: 10,
                  width: '100%',
                  borderRadius: 5,
                  overflow: 'hidden',
                  marginBottom: 10,
                  border: '1px solid var(--border)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${downloadProgress}%`,
                    background: 'linear-gradient(90deg, #0ea5e9, #6366f1)',
                    transition: 'width 0.2s ease-out'
                  }} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>
                  {downloadProgress}% Completed
                </div>
              </div>
            ) : (
              <div style={{ padding: '10px 0' }}>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Update downloaded successfully. Click Done to start installing the new packages.
                </p>
                <button
                  onClick={handleUpdateDone}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #22c55e, #10b981)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(34,197,94,0.35)'
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/patient/login" replace />} />

        {/* Patient Routes */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/patient/home" element={<PatientPrivateRoute><PatientHome /></PatientPrivateRoute>} />
        <Route path="/patient/dashboard" element={<PatientPrivateRoute><PatientHome /></PatientPrivateRoute>} />
        <Route path="/patient/profile" element={<PatientPrivateRoute><PatientProfile /></PatientPrivateRoute>} />
        <Route path="/patient/scan" element={<PatientPrivateRoute><PatientScan /></PatientPrivateRoute>} />
        <Route path="/patient/results" element={<PatientPrivateRoute><PatientResults /></PatientPrivateRoute>} />
        <Route path="/patient/doctors" element={<PatientPrivateRoute><PatientDoctors /></PatientPrivateRoute>} />
        <Route path="/patient/appointments" element={<PatientPrivateRoute><PatientAppointments /></PatientPrivateRoute>} />

        {/* Email Verification Route */}
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Doctor Routes */}
        <Route path="/doctor" element={<DoctorLanding />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/dashboard" element={<DoctorPrivateRoute><DoctorDashboard /></DoctorPrivateRoute>} />
        <Route path="/doctor/profile" element={<DoctorPrivateRoute><DoctorProfile /></DoctorPrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
