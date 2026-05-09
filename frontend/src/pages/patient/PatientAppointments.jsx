import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getPatientAppointments, getNotifications, markNotificationsRead } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'

const STATUS_LABEL = { pending: '⏳ Pending', scheduled: '✅ Scheduled', completed: '🎉 Completed' }

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('appointments')

  useEffect(() => {
    Promise.all([getPatientAppointments(), getNotifications()])
      .then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data)
        setNotifications(notifRes.data)
        markNotificationsRead().catch(() => {})
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

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
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Dr. {appt.doctor_name}</div>
                      <div style={{ color: 'var(--primary)', fontSize: 13, marginBottom: 8 }}>🏥 {appt.doctor_hospital}</div>
                      {appt.specialization && <div className="tag" style={{ marginBottom: 8 }}>{appt.specialization}</div>}
                    </div>
                    <div className={`status-badge status-${appt.status}`}>{STATUS_LABEL[appt.status] || appt.status}</div>
                  </div>
                  {appt.scheduled_date && (
                    <div className="alert alert-success" style={{ marginTop: 12 }}>
                      <span>📅</span>
                      <span>Appointment scheduled for: <strong>{new Date(appt.scheduled_date).toLocaleString()}</strong></span>
                    </div>
                  )}
                  {appt.notes && (
                    <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--glass)', borderRadius: 8, fontSize: 14, color: 'var(--text-muted)' }}>
                      📝 {appt.notes}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    Requested: {new Date(appt.created_at).toLocaleDateString()}
                  </div>
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
              {notifications.map(n => (
                <div key={n.id} className="card" style={{ background: n.is_read ? 'var(--bg-card)' : 'rgba(14,165,233,0.06)', borderColor: n.is_read ? 'var(--border)' : 'rgba(14,165,233,0.3)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24 }}>🔔</div>
                    <div>
                      <div style={{ fontSize: 14, lineHeight: 1.6 }}>{n.message}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    {!n.is_read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
