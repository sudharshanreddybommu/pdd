import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api' })

API.interceptors.request.use(config => {
  const patientToken = localStorage.getItem('patientToken')
  const doctorToken = localStorage.getItem('doctorToken')
  const token = patientToken || doctorToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const sendOtp = (email, user_type) => API.post('/send-otp', { email, user_type })
export const verifyOtp = (email, otp) => API.post('/verify-otp', { email, otp })

// Patient
export const checkPatientEmail = email => API.post('/patient/check-email', { email })
export const patientRegister = (email, password) => API.post('/patient/register', { email, password })
export const patientLogin = (email, password) => API.post('/patient/login', { email, password })
export const updatePatientProfile = data => API.put('/patient/profile', data)
export const getPatientMe = () => API.get('/patient/me')
export const analyzeScan = data => API.post('/scan/analyze', data)
export const getScanHistory = () => API.get('/scan/history')
export const getPatientAppointments = () => API.get('/patient/appointments')
export const requestAppointment = data => API.post('/appointment/request', data)

// Doctor
export const checkDoctorEmail = email => API.post('/doctor/check-email', { email })
export const doctorRegister = data => API.post('/doctor/register', data)
export const doctorSetPassword = (email, password) => API.post('/doctor/set-password', { email, password })
export const doctorLogin = (email, password) => API.post('/doctor/login', { email, password })
export const updateDoctorProfile = data => API.put('/doctor/profile', data)
export const getDoctorMe = () => API.get('/doctor/me')
export const getDoctors = () => API.get('/doctors')
export const getDoctorAppointments = () => API.get('/doctor/appointments')
export const scheduleAppointment = (id, data) => API.put(`/doctor/appointment/${id}/schedule`, data)

// Notifications
export const getNotifications = () => API.get('/notifications')
export const markNotificationsRead = () => API.put('/notifications/read')

export default API
