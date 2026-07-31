import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getPatientAppointments, getNotifications, markNotificationsRead, clearNotifications, addReview, confirmPayment } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'

const STATUS_LABEL = {
  pending: '⏳ Pending',
  scheduled: '💳 Payment Pending',
  payment_pending: '🔍 Verifying Payment',
  confirmed: '✅ Confirmed',
  completed: '🎉 Completed',
  rejected: '❌ Declined'
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('appointments')
  const [reviewing, setReviewing] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [showOPForm, setShowOPForm] = useState(null)
  const [screenshots, setScreenshots] = useState({})

  const handleScreenshotUpload = (apptId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setScreenshots(prev => ({ ...prev, [apptId]: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const load = () => {
    setLoading(true)
    Promise.all([getPatientAppointments(), getNotifications()])
      .then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data)
        setNotifications(notifRes.data)
        markNotificationsRead().catch(() => {})
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setTimeout(() => { load() }, 0);
  }, [])

  const handleClearNotifications = async () => {
    try {
      await clearNotifications()
    } catch (e) {
      console.warn('Backend clear notification note:', e)
    } finally {
      setNotifications([])
      localStorage.setItem('patientNotifications', JSON.stringify([]))
      window.dispatchEvent(new Event('notifications-cleared'))
      toast.info('Notifications cleared')
    }
  }

  const handleReviewSubmit = async (doctor_id) => {
    if (!reviewForm.rating) return toast.error('Please select a rating')
    try {
      await addReview({ doctor_id, ...reviewForm })
      toast.success('Thank you for your review!')
      setReviewing(null)
      setReviewForm({ rating: 5, comment: '' })
    } catch {
      toast.error('Failed to submit review')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // SQLite CURRENT_TIMESTAMP returns UTC without 'Z' suffix.
    // Append 'Z' so the browser correctly interprets it as UTC and
    // converts to the user's local timezone.
    const normalized = typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('T')
      ? dateString.replace(' ', 'T') + 'Z'
      : dateString;
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const handlePayment = async (appt) => {
    const screenshot = screenshots[appt.id]
    if (!screenshot) return toast.error('Please upload a payment screenshot first')
    try {
      await confirmPayment(appt.id, screenshot)
      toast.success('📤 Screenshot submitted! Waiting for doctor to verify your payment.')
      // Update status to payment_pending instantly
      setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'payment_pending' } : a))
      // Clear screenshot
      setScreenshots(prev => ({ ...prev, [appt.id]: null }))
      // Refresh in background
      Promise.all([getPatientAppointments(), getNotifications()]).then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data)
        setNotifications(notifRes.data)
      }).catch(() => {})
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit screenshot')
    }
  }

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">📅 Appointments & Notifications</h1>
          <p className="page-header-sub">Track your consultation requests and updates</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[['appointments', '📅 Appointments'], ['notifications', `🔔 Notifications ${notifications.filter(n=>!n.is_read).length > 0 ? `(${notifications.filter(n=>!n.is_read).length})` : ''}`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : tab === 'appointments' ? (
          appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No Appointments Yet</h3>
              <p style={{ fontSize: 14, marginTop: 8 }}>Go to Doctors page and request a consultation</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {appointments.map(appt => (
                <div className="appt-card" key={appt.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                        {appt.doctor_name ? (appt.doctor_name.startsWith('Dr.') ? appt.doctor_name : `Dr. ${appt.doctor_name}`) : 'Doctor'}
                      </div>
                      <div style={{ color: 'var(--primary)', fontSize: 13, marginBottom: 8 }}>🏥 {appt.doctor_hospital}</div>
                      {appt.specialization && <div className="tag" style={{ marginBottom: 8 }}>{appt.specialization}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button 
                        onClick={() => appt.status === 'confirmed' && setShowOPForm(appt)}
                        className={`btn btn-sm ${appt.status === 'confirmed' ? 'btn-primary' : 'btn-secondary'}`}
                        disabled={appt.status !== 'confirmed'}
                        style={{ opacity: appt.status !== 'confirmed' ? 0.5 : 1, cursor: appt.status === 'confirmed' ? 'pointer' : 'not-allowed' }}
                        title={appt.status !== 'confirmed' ? 'OP Form unlocks after doctor verifies your payment' : 'View OP Form'}
                      >
                        📄 OP Form
                      </button>
                      <div className={`status-badge status-${appt.status}`}>{STATUS_LABEL[appt.status] || appt.status}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(appt.doctor_address || appt.doctor_hospital || '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      📍 Get Directions on Google Maps
                    </a>
                  </div>
                  {appt.scheduled_date && (
                    <div className="alert alert-success" style={{ marginTop: 12 }}>
                      <span>📅</span>
                      <span>Appointment scheduled for: <strong>{formatDate(appt.scheduled_date)}</strong></span>
                    </div>
                  )}
                  {appt.notes && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--glass)', borderRadius: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                      📝 {appt.notes}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    Requested: {formatDate(appt.created_at)}
                  </div>

                  {/* QR Payment Section - shown when doctor schedules but patient hasn't paid */}
                  {appt.status === 'scheduled' && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <div style={{ background: 'rgba(14,165,233,0.08)', borderRadius: 12, padding: 20, border: '1px solid rgba(14,165,233,0.2)' }}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 24 }}>💳</span>
                          <span>Pay to Confirm Appointment</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                          Your appointment has been scheduled. Scan the QR code below to pay and confirm your slot.
                        </p>
                        {appt.doctor_consultation_fee && (
                          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 20 }}>💰</span>
                            <div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Consultation Fee</div>
                              <div style={{ fontWeight: 700, fontSize: 20, color: '#fbbf24' }}>₹{appt.doctor_consultation_fee}</div>
                            </div>
                          </div>
                        )}
                        {appt.doctor_payment_qr ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                            <div style={{ textAlign: 'center', background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#333' }}>1. Scan & Pay</div>
                              <img src={appt.doctor_payment_qr.startsWith('data:image') ? appt.doctor_payment_qr : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${appt.doctor_payment_qr}&pn=${appt.doctor_name || 'Doctor'}&am=${appt.doctor_consultation_fee || '200'}&cu=INR`)}`} alt="Payment QR Code"
                                style={{ width: '100%', maxWidth: 180, height: 180, borderRadius: 8, objectFit: 'contain' }} />
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Scan with UPI / GPay</div>
                            </div>
                            
                            <div style={{ textAlign: 'center', background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#333' }}>2. Upload Screenshot</div>
                              {screenshots[appt.id] ? (
                                <div style={{ position: 'relative' }}>
                                  <img src={screenshots[appt.id]} alt="Screenshot" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                  <button onClick={() => setScreenshots(prev => ({...prev, [appt.id]: null}))} style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                              ) : (
                                <label style={{ border: '2px dashed #0ea5e9', borderRadius: 8, padding: '20px 10px', cursor: 'pointer', display: 'block', background: '#f0f9ff' }}>
                                  <div style={{ fontSize: 24, marginBottom: 5 }}>📸</div>
                                  <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>Click to Upload</div>
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleScreenshotUpload(appt.id, e)} />
                                </label>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginBottom: 16 }}>
                            <div className="alert alert-warning mb-3"><span>⚠️</span><span>Doctor has not set a payment QR yet. Please upload your payment screenshot after paying via any method.</span></div>
                            <div style={{ textAlign: 'center', background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#333' }}>Upload Payment Screenshot</div>
                              {screenshots[appt.id] ? (
                                <div style={{ position: 'relative' }}>
                                  <img src={screenshots[appt.id]} alt="Screenshot" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                  <button onClick={() => setScreenshots(prev => ({...prev, [appt.id]: null}))} style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                </div>
                              ) : (
                                <label style={{ border: '2px dashed #0ea5e9', borderRadius: 8, padding: '20px 10px', cursor: 'pointer', display: 'block', background: '#f0f9ff' }}>
                                  <div style={{ fontSize: 24, marginBottom: 5 }}>📸</div>
                                  <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600 }}>Click to Upload</div>
                                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleScreenshotUpload(appt.id, e)} />
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                        <button onClick={() => handlePayment(appt)} disabled={!screenshots[appt.id]} className={`btn ${screenshots[appt.id] ? 'btn-success' : 'btn-secondary'}`} style={{ width: '100%', fontSize: 15, padding: '12px 0', opacity: screenshots[appt.id] ? 1 : 0.6, cursor: screenshots[appt.id] ? 'pointer' : 'not-allowed' }}>
                          📤 Submit Screenshot for Verification
                        </button>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>Doctor will verify your screenshot and confirm your appointment</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Pending Verification - shown after patient submits screenshot */}
                  {appt.status === 'payment_pending' && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <div style={{ background: 'rgba(251,191,36,0.08)', borderRadius: 12, padding: 20, border: '1px solid rgba(251,191,36,0.3)', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#d97706' }}>Payment Screenshot Under Review</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 0 }}>
                          Your payment screenshot has been submitted. The doctor will verify it shortly.
                          You'll receive a notification once it's accepted or if you need to re-upload.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Review Section - shown when confirmed */}
                  {appt.status === 'confirmed' && (
                    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <div className="alert alert-success" style={{ marginBottom: 12 }}>
                        <span>🎉</span><span>Appointment confirmed! See you on <strong>{formatDate(appt.scheduled_date)}</strong></span>
                      </div>
                      {reviewing === appt.id ? (
                        <div className="card" style={{ background: 'rgba(14,165,233,0.06)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 12 }}>⭐ Rate your experience</div>
                          <div className="form-group">
                            <label className="form-label">Rating</label>
                            <div style={{ display: 'flex', gap: 8, fontSize: 24, marginBottom: 12 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                  style={{ cursor: 'pointer', color: star <= reviewForm.rating ? '#fbbf24' : '#4b5563' }}>
                                  {star <= reviewForm.rating ? '⭐' : '☆'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Comment</label>
                            <textarea className="form-control" rows={2} placeholder="Write a short review..."
                              value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                          </div>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => handleReviewSubmit(appt.doctor_id)} className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
                            <button onClick={() => setReviewing(null)} className="btn btn-secondary">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setReviewing(appt.id)} className="btn btn-secondary btn-sm">⭐ Rate Doctor</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔔</div>
              <h3>No Notifications</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button onClick={handleClearNotifications} className="btn btn-secondary btn-sm">🗑️ Clear All</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="card" style={{ background: n.is_read ? 'var(--bg-card)' : 'rgba(14,165,233,0.06)', borderColor: n.is_read ? 'var(--border)' : 'rgba(14,165,233,0.3)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24 }}>🔔</div>
                    <div>
                      <div style={{ fontSize: 14, lineHeight: 1.6 }}>{n.message}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{formatDate(n.created_at)}</div>
                    </div>
                    {!n.is_read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {showOPForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div id="op-receipt-modal" className="card fade-in" style={{ width: '100%', maxWidth: 500, background: '#fff', color: '#333', padding: 30, borderRadius: 16, position: 'relative' }}>
            <button onClick={() => setShowOPForm(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#888' }}>×</button>
            
            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{showOPForm.doctor_hospital || 'OPMD Hospital'}</div>
              <div style={{ fontSize: 18, color: '#555' }}>Dr. {showOPForm.doctor_name}</div>
              <div style={{ fontSize: 14, color: '#777' }}>{showOPForm.specialization || 'Specialist'}</div>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, marginBottom: 24, background: 'rgba(14,165,233,0.1)', padding: 10, borderRadius: 8, color: 'var(--primary)' }}>
              OUTPATIENT (OP) RECEIPT
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Patient Name</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{JSON.parse(localStorage.getItem('patientUser') || '{}').name || 'N/A'}</div>
              </div>
              <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Date & Time</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{formatDate(showOPForm.scheduled_date)}</div>
              </div>
              <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Payment Status</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>PAID ✅</div>
              </div>
              <div style={{ background: '#f9fafb', padding: 14, borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Hospital Address</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{showOPForm.doctor_address || showOPForm.doctor_hospital || 'N/A'}</div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', fontSize: 13, fontStyle: 'italic', color: '#6b7280', marginBottom: 20 }}>
              Please show this receipt at the reception and arrive 15 minutes early.
            </div>
            
            <button onClick={() => {
              const printContent = document.getElementById('op-receipt-modal').innerHTML;
              const originalContent = document.body.innerHTML;
              document.body.innerHTML = printContent;
              window.print();
              document.body.innerHTML = originalContent;
              window.location.reload();
            }} className="btn btn-primary" style={{ width: '100%', fontSize: 16, padding: '12px 0' }}>
              🖨️ Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
