import axios from 'axios'
import { executeLocalFallback } from './localEngine'

const hostname = window.location.hostname;
const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.');
const API_URL = isLocalHost ? 'http://localhost:5000' : 'https://oralscan-backend-gmup.onrender.com';

const API = axios.create({ 
  baseURL: API_URL,
  timeout: 12000 // 12-second timeout to allow real Gmail SMTP OTP delivery
})

API.interceptors.request.use(config => {
  const patientToken = localStorage.getItem('patientToken')
  const doctorToken = localStorage.getItem('doctorToken')
  const isDoctorPortal = window.location.pathname.startsWith('/doctor')
  const token = isDoctorPortal ? doctorToken : patientToken

  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Helper wrapper to attempt cloud request first, then fallback to localEngine instantly
const requestWithFallback = async (method, url, data = null) => {
  try {
    let res;
    if (method === 'post') res = await API.post(url, data);
    else if (method === 'get') res = await API.get(url);
    else if (method === 'put') res = await API.put(url, data);
    else if (method === 'delete') res = await API.delete(url);
    return res;
  } catch (err) {
    if (url.includes('otp') || url.includes('verification') || url.includes('verify')) {
      throw err;
    }
    console.warn(`Cloud API (${url}) unreachable/sleeping. Activating local engine fallback...`, err);
    return await executeLocalFallback(url, data, method.toUpperCase());
  }
};

export const sendOtp = (email, user_type) => requestWithFallback('post', '/send-otp', { email, user_type })
export const verifyOtp = (email, otp) => requestWithFallback('post', '/verify-otp', { email, otp })
export const resetPassword = (email, otp, new_password, user_type) => requestWithFallback('post', '/reset-password', { email, otp, new_password, user_type })

export const sendVerificationLink = (email, user_type) => requestWithFallback('post', '/send-verification-link', { email, user_type })
export const verifyEmailToken = (token, email) => requestWithFallback('post', '/verify-email-token', { token, email })
export const checkEmailVerificationStatus = (email) => requestWithFallback('get', `/check-email-verification-status?email=${encodeURIComponent(email)}`)

// Patient API
export const checkPatientEmail = email => requestWithFallback('post', '/patient/check-email', { email })
export const patientRegister = (data, password) => typeof data === 'object' ? requestWithFallback('post', '/patient/register', data) : requestWithFallback('post', '/patient/register', { email: data, password })
export const patientLogin = (email, password) => requestWithFallback('post', '/patient/login', { email, password })
export const updatePatientProfile = data => requestWithFallback('put', '/patient/profile', data)
export const getPatientMe = () => requestWithFallback('get', '/patient/me')
export const analyzeScan = data => requestWithFallback('post', '/scan/analyze', data)
export const getScanHistory = () => requestWithFallback('get', '/scan/history')
export const getPatientAppointments = () => requestWithFallback('get', '/patient/appointments')
export const requestAppointment = data => requestWithFallback('post', '/appointment/request', data)
export const confirmPayment = (id, screenshot) => requestWithFallback('put', `/patient/appointment/${id}/pay`, { screenshot })

// Doctor API
export const checkDoctorEmail = email => requestWithFallback('post', '/doctor/check-email', { email })
export const doctorRegister = data => requestWithFallback('post', '/doctor/register', data)
export const doctorSetPassword = (email, password) => requestWithFallback('post', '/doctor/set-password', { email, password })
export const doctorLogin = (email, password) => requestWithFallback('post', '/doctor/login', { email, password })
export const updateDoctorProfile = data => requestWithFallback('put', '/doctor/profile', data)
export const getDoctorMe = () => requestWithFallback('get', '/doctor/me')
export const getDoctors = () => requestWithFallback('get', '/doctors')
export const getDoctorAppointments = () => requestWithFallback('get', '/doctor/appointments')
export const scheduleAppointment = (apptId, data) => requestWithFallback('put', `/doctor/appointment/${apptId}/schedule`, data)
export const rejectAppointment = (apptId) => requestWithFallback('put', `/doctor/appointment/${apptId}/reject`)
export const completeAppointment = (apptId) => requestWithFallback('put', `/doctor/appointment/${apptId}/complete`)
export const verifyPayment = (apptId, action) => requestWithFallback('put', `/doctor/appointment/${apptId}/verify-payment`, { action })

// Notifications
export const getNotifications = () => requestWithFallback('get', '/notifications')
export const markNotificationsRead = () => requestWithFallback('put', '/notifications/read')
export const clearNotifications = () => requestWithFallback('delete', '/notifications/clear')

// Reviews
export const addReview = data => requestWithFallback('post', '/review/add', data)
export const getDoctorReviews = id => requestWithFallback('get', `/doctor/${id}/reviews`)

export default API
