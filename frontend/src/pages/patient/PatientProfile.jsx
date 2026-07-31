import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getPatientMe, updatePatientProfile } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'

export default function PatientProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', age: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('patientUser') || localStorage.getItem('patientData') || '{}')
    if (localUser.name || localUser.email || localUser.phone) {
      setForm({
        name: localUser.name || '',
        phone: localUser.phone || '',
        address: localUser.address || '',
        age: localUser.age || ''
      })
      setFetching(false)
    }

    getPatientMe().then(r => {
      const p = r.data
      if (p) {
        setForm({ name: p.name || '', phone: p.phone || '', address: p.address || '', age: p.age || '' })
        const merged = { ...localUser, ...p }
        localStorage.setItem('patientUser', JSON.stringify(merged))
        localStorage.setItem('patientData', JSON.stringify(merged))
      }
    }).catch(() => {}).finally(() => setFetching(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.age) return toast.error('Please fill all required fields')
    setLoading(true)
    try {
      const res = await updatePatientProfile(form)
      const current = JSON.parse(localStorage.getItem('patientUser') || localStorage.getItem('patientData') || '{}')
      const updated = { ...current, ...form, ...(res.data?.patient || {}) }
      localStorage.setItem('patientUser', JSON.stringify(updated))
      localStorage.setItem('patientData', JSON.stringify(updated))
      toast.success('Profile saved successfully!')
      navigate('/patient/home')
    } catch {
      const current = JSON.parse(localStorage.getItem('patientUser') || localStorage.getItem('patientData') || '{}')
      const updated = { ...current, ...form }
      localStorage.setItem('patientUser', JSON.stringify(updated))
      localStorage.setItem('patientData', JSON.stringify(updated))
      toast.success('Profile saved locally!')
      navigate('/patient/home')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="page"><PatientNavbar />
      <div className="flex-center" style={{ height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
    </div>
  )

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ maxWidth: 640, paddingTop: 40 }}>
        <div className="page-header">
          <h1 className="page-header-title">👤 My Profile</h1>
          <p className="page-header-sub">Complete your profile to continue using the platform</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-control" placeholder="+91 9876543210" type="tel"
                  value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input className="form-control" placeholder="25" type="number" min="1" max="120"
                  value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" placeholder="Your full address" rows={3}
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
