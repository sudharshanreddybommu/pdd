import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getDoctorAppointments, scheduleAppointment, rejectAppointment, completeAppointment, getNotifications, markNotificationsRead, clearNotifications } from '../../services/api'
import DoctorNavbar from '../../components/DoctorNavbar'

const STATUS_LABEL = { pending: '⏳ Pending', scheduled: '✅ Scheduled', completed: '🎉 Completed' }
const RISK_CONFIG = {
  low: { label: 'Low Risk', cls: 'risk-low' },
  moderate: { label: 'Moderate Risk', cls: 'risk-moderate' },
  high: { label: 'High Risk', cls: 'risk-high' },
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [scheduling, setScheduling] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({ date: '', notes: '' })
  const [expanded, setExpanded] = useState(null)
  const doctor = JSON.parse(localStorage.getItem('doctorUser') || '{}')

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const load = () => {
    Promise.all([getDoctorAppointments(), getNotifications()])
      .then(([apptRes, notifRes]) => {
        setAppointments(apptRes.data)
        setNotifications(notifRes.data)
        markNotificationsRead().catch(() => {})
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSchedule = async (apptId) => {
    if (!scheduleForm.date) return toast.error('Please select appointment date/time')
    try {
      await scheduleAppointment(apptId, { scheduled_date: scheduleForm.date, notes: scheduleForm.notes })
      toast.success('Appointment scheduled! Patient notified.')
      setScheduling(null)
      setScheduleForm({ date: '', notes: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to schedule')
    }
  }

  const handleReject = async (apptId) => {
    try {
      await rejectAppointment(apptId)
      toast.info('Appointment declined')
      load()
    } catch (err) {
      toast.error('Failed to decline')
    }
  }

  const handleClearNotifications = async () => {
    try {
      await clearNotifications()
      toast.info('Notifications cleared')
      load()
    } catch (err) {
      toast.error('Failed to clear')
    }
  }

  const handleComplete = async (apptId) => {
    try {
      await completeAppointment(apptId)
      toast.success('Appointment marked as completed!')
      load()
    } catch (err) {
      toast.error('Failed to mark as completed')
    }
  }

  const pending = appointments.filter(a => a.status === 'pending')
  const scheduled = appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed')
  const completed = appointments.filter(a => a.status === 'completed')
  const rejected = appointments.filter(a => a.status === 'rejected')
  const unread = notifications.filter(n => !n.is_read).length

  const tabData = { pending, scheduled, completed, rejected, all: appointments }
  const shown = tabData[tab] || []

  return (
    <div className="page fade-in">
      <DoctorNavbar unread={unread} />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">📊 Dashboard</h1>
          <p className="page-header-sub">Welcome back, Dr. {doctor.name || 'Doctor'}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { val: appointments.length, label: 'Total Requests', icon: '📋' },
            { val: pending.length, label: 'Pending', icon: '⏳' },
            { val: scheduled.length, label: 'Scheduled', icon: '✅' },
            { val: completed.length, label: 'Completed', icon: '🎉' },
            { val: unread, label: 'New Alerts', icon: '🔔' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[['pending', `⏳ Pending (${pending.length})`], ['scheduled', `✅ Scheduled (${scheduled.length})`], ['completed', `🎉 Completed (${completed.length})`], ['rejected', `❌ Cancelled (${rejected.length})`], ['all', `📋 All (${appointments.length})`], ['notifications', `🔔 Notifications`]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} className={`btn ${tab === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{label}</button>
          ))}
        </div>

        {/* Notifications Tab */}
        {tab === 'notifications' ? (
          notifications.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🔔</div><h3>No Notifications</h3></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <button onClick={handleClearNotifications} className="btn btn-secondary btn-sm">🗑️ Clear All</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="card" style={{ background: n.is_read ? 'var(--bg-card)' : 'rgba(14,165,233,0.06)', borderColor: n.is_read ? 'var(--border)' : 'rgba(14,165,233,0.3)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24 }}>🔔</div>
                    <div><div style={{ fontSize: 14, lineHeight: 1.6 }}>{n.message}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{formatDate(n.created_at)}</div>
                    </div>
                    {!n.is_read && <div style={{ width: 8, height: 8, background: 'var(--primary)', borderRadius: '50%', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : loading ? (
          <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : shown.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><h3>No {tab} appointments</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {shown.map(appt => {
              const riskCfg = RISK_CONFIG[appt.risk_level] || {}
              const isOpen = expanded === appt.id
              const suggestions = Array.isArray(appt.suggestions) ? appt.suggestions : []
              return (
                <div className="appt-card" key={appt.id}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>{appt.patient_name || 'Unknown Patient'}</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        {appt.patient_age && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Age: {appt.patient_age}</span>}
                        {appt.patient_phone && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>📞 {appt.patient_phone}</span>}
                        {appt.risk_level && <span className={`risk-badge ${riskCfg.cls}`}>{riskCfg.label}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div className={`status-badge status-${appt.status}`}>{STATUS_LABEL[appt.status] || appt.status}</div>
                      <button onClick={() => setExpanded(isOpen ? null : appt.id)}
                        className="btn btn-secondary btn-sm">{isOpen ? '▲ Hide' : '▼ Details'}</button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div style={{ marginTop: 20 }}>
                      {appt.prediction && (
                        <div className="card mb-2" style={{ background: 'var(--glass)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 8 }}>🤖 AI Prediction</div>
                          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{appt.prediction}</div>
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div className="card mb-2" style={{ background: 'var(--glass)' }}>
                          <div style={{ fontWeight: 700, marginBottom: 10 }}>💡 AI Suggestions</div>
                          <ul className="suggestions-list">
                            {suggestions.slice(0, 4).map((s, i) => (
                              <li key={i} className="suggestion-item">
                                <div className="suggestion-dot" /><span style={{ fontSize: 13 }}>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {appt.scheduled_date && (
                        <div className="alert alert-success mb-2"><span>📅</span><span>Scheduled: <strong>{formatDate(appt.scheduled_date)}</strong></span></div>
                      )}
                      {appt.notes && (
                        <div style={{ padding: '10px 14px', background: 'var(--glass)', borderRadius: 8, fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>📝 {appt.notes}</div>
                      )}

                      {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                          <button onClick={() => handleComplete(appt.id)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                            ✅ Mark as Completed
                          </button>
                          <button onClick={() => handleReject(appt.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)' }}>
                            ❌ Cancel Appointment
                          </button>
                        </div>
                      )}

                      {/* Schedule Form */}
                      {appt.status === 'pending' && (
                        scheduling === appt.id ? (
                          <div className="card" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
                            <div style={{ fontWeight: 700, marginBottom: 16 }}>📅 Schedule Appointment</div>
                            <div className="form-group">
                              <label className="form-label">Date & Time *</label>
                              <input type="datetime-local" className="form-control"
                                value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Notes (optional)</label>
                              <textarea className="form-control" rows={2} placeholder="Any instructions for the patient..."
                                value={scheduleForm.notes} onChange={e => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button onClick={() => handleSchedule(appt.id)} className="btn btn-success">✅ Confirm Schedule</button>
                              <button onClick={() => setScheduling(null)} className="btn btn-secondary">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setScheduling(appt.id)} className="btn btn-primary" style={{ flex: 1 }}>📅 Schedule</button>
                            <button onClick={() => handleReject(appt.id)} className="btn btn-danger">❌ Decline</button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                    Requested: {formatDate(appt.created_at)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
