import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getDoctorMe, updateDoctorProfile } from '../../services/api'
import DoctorNavbar from '../../components/DoctorNavbar'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage'

export default function DoctorProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', hospital: '', address: '', specialization: '', profile_image: '', payment_qr: '', consultation_fee: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Cropper states
  const [imageToCrop, setImageToCrop] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  useEffect(() => {
    getDoctorMe().then(r => {
      const d = r.data
      setForm({
        name: d.name || '',
        phone: d.phone || '',
        hospital: d.hospital || '',
        address: d.address || '',
        specialization: d.specialization || '',
        profile_image: d.profile_image || '',
        payment_qr: d.payment_qr || '',
        consultation_fee: d.consultation_fee || ''
      })
    }).catch(() => toast.error('Failed to load profile')).finally(() => setFetching(false))
  }, [])

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
      setForm({ ...form, profile_image: croppedImage })
      setImageToCrop(null)
    } catch (e) {
      console.error(e)
      toast.error('Failed to crop image')
    }
  }

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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justify_content: 'center', fontSize: 48, overflow: 'hidden', border: '4px solid var(--glass-border)' }}>
                {form.profile_image ? <img src={form.profile_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍⚕️'}
              </div>
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justify_content: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                <span>📷</span>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = ev => setImageToCrop(ev.target.result)
                    reader.readAsDataURL(file)
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Cropper Modal */}
          {imageToCrop && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 500, height: 400, background: '#000', borderRadius: 16, overflow: 'hidden' }}>
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div style={{ width: '100%', maxWidth: 500, marginTop: 20, background: 'var(--bg-card)', padding: 20, borderRadius: 16 }}>
                <div style={{ marginBottom: 15 }}>
                  <label className="form-label">Zoom</label>
                  <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={showCroppedImage} className="btn btn-primary" style={{ flex: 1 }}>Apply Crop</button>
                  <button onClick={() => setImageToCrop(null)} className="btn btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

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

            {/* Payment QR Section */}
            <div style={{ marginTop: 8, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>💳 Payment Settings</div>
              <div className="form-group">
                <label className="form-label">💰 Consultation Fee (₹)</label>
                <input className="form-control" type="number" placeholder="200"
                  value={form.consultation_fee} onChange={e => setForm({ ...form, consultation_fee: e.target.value })} />
                <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Shown to patients to pay via QR.</small>
              </div>
              <div className="form-group">
                <label className="form-label">📱 UPI ID (for dynamic QR payments)</label>
                <input className="form-control" type="text" placeholder="e.g. 9876543210@ybl"
                  value={form.payment_qr} onChange={e => setForm({ ...form, payment_qr: e.target.value })} />
                <small style={{ color: 'var(--text-muted)', fontSize: 12 }}>Enter your UPI ID. We will generate a QR code that automatically includes your consultation fee.</small>
              </div>
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
