import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { analyzeScan } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'
import OralCareChatbot from '../../components/OralCareChatbot'
import { validateOralImage } from '../../utils/oralValidator'

const VIEWS = [
  { key: 'left_image',  label: 'Left View',  icon: '⬅️', desc: 'Open mouth wide, capture left inner cheek & gum area' },
  { key: 'front_image', label: 'Front View', icon: '👄', desc: 'Open mouth straight, capture tongue, teeth & centre of mouth' },
  { key: 'right_image', label: 'Right View', icon: '➡️', desc: 'Open mouth wide, capture right inner cheek & gum area' },
]

const SYMPTOMS = [
  { key: 'mouth_ulcer',       label: 'Mouth Ulcer',         icon: '🔴', desc: 'Open sore inside the mouth' },
  { key: 'white_patch',       label: 'White Patch',         icon: '⚪', desc: 'White coating or patch on tongue/cheek' },
  { key: 'red_patch',         label: 'Red Patch',           icon: '🟥', desc: 'Reddish lesion inside mouth' },
  { key: 'mouth_pain',        label: 'Mouth Pain',          icon: '😣', desc: 'Persistent pain or discomfort' },
  { key: 'burning_sensation', label: 'Burning Sensation',   icon: '🔥', desc: 'Burning feeling in mouth or tongue' },
  { key: 'smoking',           label: 'Smoking',             icon: '🚬', desc: 'Current or past smoking habit' },
  { key: 'tobacco',           label: 'Tobacco / Betel Nut', icon: '🌿', desc: 'Chewing tobacco or betel nut use' },
  { key: 'alcohol',           label: 'Alcohol Use',         icon: '🍺', desc: 'Regular alcohol consumption' },
  { key: 'swallowing',        label: 'Difficulty Swallowing', icon: '🤐', desc: 'Trouble swallowing or opening mouth' },
]

export default function PatientScan() {
  const navigate  = useNavigate()
  const [images,   setImages]   = useState({ left_image: null, front_image: null, right_image: null })
  const [previews, setPreviews] = useState({ left_image: null, front_image: null, right_image: null })
  const [symptoms, setSymptoms] = useState({})   // key → true/false
  const [loading,  setLoading]  = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const inputRefs = useRef({})

  /* ---------- image helpers ---------- */
  const handleFile = (key, file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please upload a valid image file')
    const reader = new FileReader()
    reader.onload = async e => {
      const base64 = e.target.result
      const isValid = await validateOralImage(base64)
      if (!isValid) {
        toast.error('❌ Invalid Image: Please upload only clear mouth / oral cavity photos (lips, tongue, gums, inner cheeks). Non-oral photos are rejected.')
        return
      }
      setImages(prev  => ({ ...prev,  [key]: base64 }))
      setPreviews(prev => ({ ...prev, [key]: base64 }))
      toast.success('Oral cavity photo validated!')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (key, e) => {
    e.preventDefault()
    setDragOver(null)
    handleFile(key, e.dataTransfer.files[0])
  }

  const removeImage = key => {
    setImages(prev  => ({ ...prev,  [key]: null }))
    setPreviews(prev => ({ ...prev, [key]: null }))
  }

  /* ---------- symptom toggle ---------- */
  const toggleSymptom = key =>
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }))

  /* ---------- analyze ---------- */
  const handleAnalyze = async () => {
    const uploaded = Object.values(images).filter(Boolean).length
    if (uploaded === 0) return toast.error('Please upload at least one oral cavity image')

    // Convert symptoms to 0/1 for backend
    const symptomPayload = {}
    SYMPTOMS.forEach(s => { symptomPayload[s.key] = symptoms[s.key] ? 1 : 0 })

    setLoading(true)
    try {
      const res = await analyzeScan({
        left_image:  images.left_image  || '',
        front_image: images.front_image || '',
        right_image: images.right_image || '',
        symptoms:    symptomPayload,
      })
      sessionStorage.setItem('scanResult', JSON.stringify(res.data))
      toast.success('Analysis complete!')
      navigate('/patient/results')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const uploaded       = Object.values(images).filter(Boolean).length
  const symptomsActive = Object.values(symptoms).filter(Boolean).length

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">🔍 Oral Scan</h1>
          <p className="page-header-sub">Upload photos from three angles and report your symptoms for AI-powered OPMD detection</p>
        </div>

        {/* Tip Banner */}
        <div className="alert alert-info mb-3">
          <span>💡</span>
          <span>For best results: Use bright lighting, hold camera steady at 6–8 cm from mouth, and open wide. Avoid dark or blurry images.</span>
        </div>

        {/* ── STEP 1 – Three-View Upload ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">📸 Step 1 — Upload Oral Cavity Images (3 Views)</h3>
          <p className="card-subtitle mb-3" style={{ marginBottom: 20 }}>
            Upload Left, Front, and Right view photos. At least one view is required.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {VIEWS.map(view => (
              <div key={view.key}>
                {/* Label */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{view.icon} {view.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{view.desc}</div>
                </div>

                {previews[view.key] ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={previews[view.key]}
                      alt={view.label}
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--primary)' }}
                    />
                    <button
                      onClick={() => removeImage(view.key)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', borderRadius: 5, padding: '3px 9px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                      ✕
                    </button>
                    <div style={{ marginTop: 6, textAlign: 'center', fontSize: 12, color: 'var(--success)' }}>✓ Uploaded</div>
                  </div>
                ) : (
                  <div
                    className={`upload-area ${dragOver === view.key ? 'dragover' : ''}`}
                    style={{ padding: 24, minHeight: 150 }}
                    onDragOver={e => { e.preventDefault(); setDragOver(view.key) }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(view.key, e)}
                    onClick={() => inputRefs.current[view.key]?.click()}
                  >
                    <div style={{ fontSize: 34, marginBottom: 8 }}>📷</div>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Drop image here</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>or click to browse</div>
                    <button type="button" className="btn btn-secondary btn-sm">Choose File</button>
                    <input
                      ref={el => inputRefs.current[view.key] = el}
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => handleFile(view.key, e.target.files[0])}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 2 – Symptom Cards ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">🩺 Step 2 — Report Your Symptoms</h3>
          <p className="card-subtitle" style={{ marginBottom: 20 }}>
            Tap each symptom you are currently experiencing. This improves AI prediction accuracy.
            {symptomsActive > 0 && (
              <span style={{ marginLeft: 10, color: 'var(--primary)', fontWeight: 600 }}>
                {symptomsActive} selected
              </span>
            )}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
            gap: 12,
          }}>
            {SYMPTOMS.map(s => {
              const active = !!symptoms[s.key]
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSymptom(s.key)}
                  style={{
                    background: active ? 'var(--primary)' : 'var(--surface-2)',
                    border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 12,
                    padding: '14px 10px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    color: active ? '#fff' : 'var(--text)',
                    transform: active ? 'scale(1.03)' : 'scale(1)',
                    boxShadow: active ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.75, lineHeight: 1.3 }}>{s.desc}</div>
                  <div style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    borderRadius: 20,
                    padding: '3px 10px',
                    display: 'inline-block',
                  }}>
                    {active ? '✓ YES' : 'NO'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── STEP 3 – Run Analysis ── */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 className="card-title mb-1">🤖 Step 3 — Run AI Analysis</h3>
          <p className="card-subtitle" style={{ marginBottom: 20 }}>
            {uploaded} of 3 images uploaded · {symptomsActive} symptoms reported
          </p>

          {/* Progress Bar */}
          <div style={{ maxWidth: 400, margin: '0 auto 24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Images: {uploaded}/3</span>
              <span>Symptoms: {symptomsActive}/9</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((uploaded / 3) * 60 + (symptomsActive / 9) * 40)}%`,
                background: 'var(--gradient)',
                borderRadius: 99,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="btn btn-primary btn-lg"
            disabled={loading || uploaded === 0}
            style={{ minWidth: 240 }}
          >
            {loading ? (
              <><div className="spinner" />&nbsp;Analyzing with AI…</>
            ) : (
              '🤖 Analyze Oral Cavity'
            )}
          </button>

          {uploaded === 0 && (
            <p className="text-muted mt-2" style={{ fontSize: 13 }}>
              Upload at least one oral cavity image to begin analysis
            </p>
          )}
        </div>
      </div>
      <OralCareChatbot />
    </div>
  )
}
