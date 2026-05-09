import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Patient Pages
import PatientLogin from './pages/patient/PatientLogin'
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

import './App.css'

const PatientPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('patientToken')
  return token ? children : <Navigate to="/patient/login" replace />
}

const DoctorPrivateRoute = ({ children }) => {
  const token = localStorage.getItem('doctorToken')
  return token ? children : <Navigate to="/doctor/login" replace />
}

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/patient/login" replace />} />

        {/* Patient Routes */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/home" element={<PatientPrivateRoute><PatientHome /></PatientPrivateRoute>} />
        <Route path="/patient/profile" element={<PatientPrivateRoute><PatientProfile /></PatientPrivateRoute>} />
        <Route path="/patient/scan" element={<PatientPrivateRoute><PatientScan /></PatientPrivateRoute>} />
        <Route path="/patient/results" element={<PatientPrivateRoute><PatientResults /></PatientPrivateRoute>} />
        <Route path="/patient/doctors" element={<PatientPrivateRoute><PatientDoctors /></PatientPrivateRoute>} />
        <Route path="/patient/appointments" element={<PatientPrivateRoute><PatientAppointments /></PatientPrivateRoute>} />

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
