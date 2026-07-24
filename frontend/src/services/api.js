import axios from 'axios'

// Use VITE_API_URL from environment variables if available, otherwise fallback to local development server
const API_URL = import.meta.env.VITE_API_URL || '/api'
const API = axios.create({ baseURL: API_URL })

API.interceptors.request.use(config => {
  const patientToken = localStorage.getItem('patientToken')
  const doctorToken = localStorage.getItem('doctorToken')
  
  // Decide which token to use based on the current portal context
  const isDoctorPortal = window.location.pathname.startsWith('/doctor')
  const token = isDoctorPortal ? doctorToken : patientToken

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const sendOtp = (email, user_type) => API.post('/send-otp', { email, user_type })
export const verifyOtp = (email, otp) => API.post('/verify-otp', { email, otp })

// Patient
export const checkPatientEmail = email => API.post('/patient/check-email', { email })
export const patientRegister = (data, password) => typeof data === 'object' ? API.post('/patient/register', data) : API.post('/patient/register', { email: data, password })
export const patientLogin = (email, password) => API.post('/patient/login', { email, password })
export const updatePatientProfile = data => API.put('/patient/profile', data)
export const getPatientMe = () => API.get('/patient/me')
export const analyzeScan = data => API.post('/scan/analyze', data)
export const getScanHistory = () => API.get('/scan/history')
export const getPatientAppointments = () => API.get('/patient/appointments')
export const requestAppointment = data => API.post('/appointment/request', data)
export const confirmPayment = (id, screenshot) => API.put(`/patient/appointment/${id}/pay`, { screenshot })

// Doctor
export const checkDoctorEmail = email => API.post('/doctor/check-email', { email })
export const doctorRegister = data => API.post('/doctor/register', data)
export const doctorSetPassword = (email, password) => API.post('/doctor/set-password', { email, password })
export const doctorLogin = (email, password) => API.post('/doctor/login', { email, password })
export const updateDoctorProfile = data => API.put('/doctor/profile', data)
export const getDoctorMe = () => API.get('/doctor/me')
export const getDoctors = () => API.get('/doctors')
export const getDoctorAppointments = () => API.get('/doctor/appointments')
export const scheduleAppointment = (apptId, data) => API.put(`/doctor/appointment/${apptId}/schedule`, data)
export const rejectAppointment = (apptId) => API.put(`/doctor/appointment/${apptId}/reject`)
export const completeAppointment = (apptId) => API.put(`/doctor/appointment/${apptId}/complete`)
export const verifyPayment = (apptId, action) => API.put(`/doctor/appointment/${apptId}/verify-payment`, { action })

// Notifications
export const getNotifications = () => API.get('/notifications')
export const markNotificationsRead = () => API.put('/notifications/read')
export const clearNotifications = () => API.delete('/notifications/clear')

// Reviews
export const addReview = data => API.post('/review/add', data)
export const getDoctorReviews = id => API.get(`/doctor/${id}/reviews`)

export default API
