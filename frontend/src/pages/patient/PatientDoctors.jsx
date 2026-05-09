import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getDoctors, requestAppointment } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'

export default function PatientDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getDoctors().then(r => setDoctors(r.data))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }, [])

  const handleRequest = async (doctorId) => {
    const scanResult = sessionStorage.getItem('scanResult')
    const scanId = scanResult ? JSON.parse(scanResult).scan_id : null
    setRequesting(doctorId)
    try {
      await requestAppointment({ doctor_id: doctorId, scan_id: scanId })
      toast.success('Appointment request sent! The doctor will contact you soon.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request')
    } finally {
      setRequesting(null)
    }
  }

  const filtered = doctors.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.hospital || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">👨‍⚕️ Available Doctors</h1>
          <p className="page-header-sub">All doctors are verified specialists in oral health and oncology</p>
        </div>

        <div className="form-group mb-3" style={{ maxWidth: 400 }}>
          <input className="form-control" placeholder="🔍 Search by name, hospital, specialization..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex-center" style={{ height: 300 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍⚕️</div>
            <h3>{search ? 'No doctors match your search' : 'No doctors available yet'}</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              {search ? 'Try a different search term' : 'Verified doctors will appear here once approved by admin'}
            </p>
          </div>
        ) : (
          <div className="awareness-grid">
            {filtered.map(doc => (
              <div className="doctor-card" key={doc.id}>
                <div className="doctor-avatar">
                  {(doc.name || 'D').charAt(0).toUpperCase()}
                </div>
                <div className="doctor-name">Dr. {doc.name}</div>
                <div className="doctor-hospital">🏥 {doc.hospital || 'Hospital not specified'}</div>
                {doc.specialization && (
                  <div className="tag" style={{ marginBottom: 12 }}>{doc.specialization}</div>
                )}
                <div className="doctor-info">
                  {doc.phone && <div className="doctor-info-item">📞 <span>{doc.phone}</span></div>}
                  {doc.address && <div className="doctor-info-item">📍 <span>{doc.address}</span></div>}
                </div>
                <div className="divider" />
                <button
                  onClick={() => handleRequest(doc.id)}
                  className="btn btn-primary btn-block"
                  disabled={requesting === doc.id}
                >
                  {requesting === doc.id ? <div className="spinner" /> : '📅 Request Appointment'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
