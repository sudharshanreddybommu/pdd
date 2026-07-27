import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lemllfxxfyrpqsppcikc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbWxsZnh4ZnlycHFzcHBjaWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTA0NzAsImV4cCI6MjA5Mzc2NjQ3MH0.3bMBNzve2SCxBP2XnHiuIk8ovnNl8HUEX72wKNs3kwM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Send 6-digit Email OTP code via Supabase Auth
 * @param {string} email - e.g. "user@example.com"
 */
export const sendSupabaseEmailOtp = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true
    }
  })
  if (error) throw error
  return data
}

/**
 * Verify 6-digit Email OTP code received in email inbox
 * @param {string} email
 * @param {string} otpToken - 6 digit numeric code
 */
export const verifySupabaseEmailOtp = async (email, otpToken) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: otpToken.trim(),
    type: 'email'
  })
  if (error) throw error
  return data
}

/**
 * Login anytime with Email + Password via Supabase Auth
 * @param {string} email
 * @param {string} password
 */
export const loginSupabaseEmailPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password
  })
  if (error) throw error
  return data
}

/**
 * Send 6-digit SMS OTP code directly to mobile phone via Supabase Auth
 * @param {string} phoneNumber - e.g. "9876543210" or "+919876543210"
 */
export const sendPhoneOtp = async (phoneNumber) => {
  const formattedPhone = phoneNumber.trim().startsWith('+') 
    ? phoneNumber.trim() 
    : `+91${phoneNumber.trim()}`

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone
  })

  if (error) throw error
  return data
}

/**
 * Verify 6-digit SMS OTP code received on mobile phone
 * @param {string} phoneNumber - e.g. "9876543210" or "+919876543210"
 * @param {string} otpToken - 6 digit numeric code
 */
export const verifyPhoneOtp = async (phoneNumber, otpToken) => {
  const formattedPhone = phoneNumber.trim().startsWith('+') 
    ? phoneNumber.trim() 
    : `+91${phoneNumber.trim()}`

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token: otpToken.trim(),
    type: 'sms'
  })

  if (error) throw error
  return data
}
