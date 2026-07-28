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
  
  /* 📷 Live Camera Modal State */
  const [cameraModal, setCameraModal] = useState(null) // key of active view e.g. 'front_image'
  const [cameraFacing, setCameraFacing] = useState('user') // 'user' or 'environment'
  const videoRef = useRef(null)
  const streamRef = useRef(null)
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

  /* 📷 Live Camera Functions */
  const openLiveCamera = async (key) => {
    setCameraModal(key)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera Access Error:', err)
      toast.error('Unable to access camera. Please check camera permissions.')
      stopCamera()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraModal(null)
  }

  const switchCameraFacing = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user'
    setCameraFacing(nextFacing)
    stopCamera()
    setTimeout(() => openLiveCamera(cameraModal), 200)
  }

  const captureCameraSnapshot = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', 0.9)

    const isValid = await validateOralImage(base64)
    if (!isValid) {
      toast.error('❌ Invalid Image: Please position mouth clearly inside the camera guide line!')
      return
    }

    setImages(prev => ({ ...prev, [cameraModal]: base64 }))
    setPreviews(prev => ({ ...prev, [cameraModal]: base64 }))
    toast.success('Camera snapshot captured & validated!')
    stopCamera()
  }

  /* ---------- symptom toggle ---------- */
  const toggleSymptom = key =>
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }))

  /* ---------- analyze ---------- */
  const handleAnalyze = async () => {
    const uploaded = Object.values(images).filter(Boolean).length
    if (uploaded === 0) return toast.error('Please upload or capture at least one oral cavity image')

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
          <h1 className="page-header-title">🔍 Oral Scan & Screening</h1>
          <p className="page-header-sub">Capture or upload mouth photos from 3 angles and report symptoms for AI-powered OPMD diagnosis</p>
        </div>

        {/* Tip Banner */}
        <div className="alert alert-info mb-3">
          <span>💡</span>
          <span>For best results: Use bright lighting, hold camera steady at 6–8 cm from mouth, open wide, and align inside the guide frame.</span>
        </div>

        {/* ── STEP 1 – Three-View Upload & Camera Capture ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">📸 Step 1 — Capture or Upload Oral Cavity Images (3 Views)</h3>
          <p className="card-subtitle mb-3" style={{ marginBottom: 20 }}>
            Capture with live camera or upload photo files for Left, Front, and Right views.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
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
                    <div style={{ marginTop: 6, textAlign: 'center', fontSize: 12, color: 'var(--success)', fontWeight: 700 }}>✓ Image Validated</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div
                      className={`upload-area ${dragOver === view.key ? 'dragover' : ''}`}
                      style={{ padding: 20, minHeight: 130 }}
                      onDragOver={e => { e.preventDefault(); setDragOver(view.key) }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={e => handleDrop(view.key, e)}
                      onClick={() => inputRefs.current[view.key]?.click()}
                    >
                      <div style={{ fontSize: 30, marginBottom: 6 }}>📁</div>
                      <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 13 }}>Upload File / Drop Image</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, WEBP</div>
                      <input
                        ref={el => inputRefs.current[view.key] = el}
                        type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => handleFile(view.key, e.target.files[0])}
                      />
                    </div>

                    {/* 📷 Live Camera Button */}
                    <button
                      type="button"
                      onClick={() => openLiveCamera(view.key)}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      <span>📷</span>
                      <span>Open Live Camera</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 2 – Symptom Cards ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">🩺 Step 2 — Report Your Symptoms & Risk Habits</h3>
          <p className="card-subtitle" style={{ marginBottom: 20 }}>
            Tap each symptom or habit you are experiencing. This directly influences the AI diagnostic risk matrix.
            {symptomsActive > 0 && (
              <span style={{ marginLeft: 10, color: 'var(--primary)', fontWeight: 600 }}>
                ({symptomsActive} selected)
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
                    textAlign: 'left',
                    color: active ? '#fff' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 4px 14px rgba(14,165,233,0.3)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11, opacity: active ? 0.9 : 0.6 }}>{s.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── STEP 3 – Run Analysis ── */}
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px' }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>🚀 Ready for AI Diagnostic Analysis</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 480, margin: '0 auto 20px' }}>
            {uploaded} image(s) uploaded | {symptomsActive} symptom(s) reported
          </p>
          <button
            onClick={handleAnalyze}
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{
              padding: '14px 44px',
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 30,
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              boxShadow: '0 6px 20px rgba(14,165,233,0.4)',
              border: 'none',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="spinner" />
                <span>Running AI Deep Learning Diagnosis...</span>
              </div>
            ) : (
              '⚡ Analyze Oral Cavity Now →'
            )}
          </button>
        </div>
      </div>

      {/* 📷 LIVE CAMERA STREAM MODAL */}
      {cameraModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 99999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 540, borderRadius: 20, overflow: 'hidden', background: '#000', border: '2px solid var(--primary)' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: 380, objectFit: 'cover' }}
            />

            {/* Oval Mouth Alignment Guide Overlay */}
            <div style={{
              position: 'absolute', top: '15%', left: '20%', width: '60%', height: '70%',
              border: '3px dashed rgba(14,165,233,0.9)', borderRadius: '50%',
              boxShadow: '0 0 30px rgba(14,165,233,0.4)', pointerEvents: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: 12, color: '#fff', fontWeight: 800, background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: 12 }}>
                👄 Align Mouth Here
              </span>
            </div>

            {/* Top Close Button */}
            <button
              onClick={stopCamera}
              style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Camera Action Buttons */}
          <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
            <button
              onClick={captureCameraSnapshot}
              className="btn btn-primary btn-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', border: 'none', borderRadius: 30, padding: '12px 32px', fontSize: 15, fontWeight: 800 }}
            >
              📸 Take Snapshot
            </button>

            <button
              onClick={switchCameraFacing}
              className="btn btn-secondary"
              style={{ borderRadius: 30, padding: '12px 20px' }}
            >
              🔄 Flip Camera
            </button>

            <button
              onClick={stopCamera}
              className="btn btn-secondary"
              style={{ borderRadius: 30, padding: '12px 20px' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Floating Chatbot Assistant */}
      <OralCareChatbot />
    </div>
  )
}
