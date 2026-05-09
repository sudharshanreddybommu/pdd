import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getDoctorMe, updateDoctorProfile } from '../../services/api'
import DoctorNavbar from '../../components/DoctorNavbar'

export default function DoctorProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', hospital: '', address: '', specialization: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getDoctorMe().then(r => {
      const d = r.data
      setForm({ name: d.name || '', phone: d.phone || '', hospital: d.hospital || '', address: d.address || '', specialization: d.specialization || '' })
    }).catch(() => toast.error('Failed to load profile')).finally(() => setFetching(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.hospital) return toast.error('Please fill required fields')
    setLoading(true)
    try {
      const res = await updateDoctorProfile(form)
      localStorage.setItem('doctorUser', JSON.stringify(res.data.doctor))
      toast.success('Profile saved!')
      navigate('/doctor/dashboard')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const SPECIALIZATIONS = ['Oral Medicine & Radiology', 'Oral & Maxillofacial Surgery', 'Oral Oncology', 'Periodontics', 'Oral Pathology', 'General Dentistry', 'ENT Specialist']

  if (fetching) return (
    <div className="page"><DoctorNavbar />
      <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
    </div>
  )

  return (
    <div className="page fade-in">
      <DoctorNavbar />
      <div className="container" style={{ maxWidth: 640, paddingTop: 40 }}>
        <div className="page-header">
          <h1 className="page-header-title">👨‍⚕️ Doctor Profile</h1>
          <p className="page-header-sub">Complete your professional profile to appear in patient listings</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="Dr. John Smith"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-control" type="tel" placeholder="+91 9876543210"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <select className="form-control" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hospital / Clinic Name *</label>
              <input className="form-control" placeholder="City General Hospital"
                value={form.hospital} onChange={e => setForm({ ...form, hospital: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Hospital Address</label>
              <textarea className="form-control" rows={3} placeholder="Full hospital address"
                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <div className="spinner" /> : '💾 Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
