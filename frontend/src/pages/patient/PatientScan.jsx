import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { analyzeScan } from '../../services/api'
import PatientNavbar from '../../components/PatientNavbar'

const VIEWS = [
  { key: 'left_image', label: 'Left View', icon: '⬅️', desc: 'Open mouth wide, capture left inner cheek and gum area' },
  { key: 'right_image', label: 'Right View', icon: '➡️', desc: 'Open mouth wide, capture right inner cheek and gum area' },
]

export default function PatientScan() {
  const navigate = useNavigate()
  const [images, setImages] = useState({ left_image: null, right_image: null })
  const [previews, setPreviews] = useState({ left_image: null, right_image: null })
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(null)
  const inputRefs = useRef({})

  const handleFile = (key, file) => {
    if (!file || !file.type.startsWith('image/')) return toast.error('Please upload a valid image')
    const reader = new FileReader()
    reader.onload = e => {
      setImages(prev => ({ ...prev, [key]: e.target.result }))
      setPreviews(prev => ({ ...prev, [key]: e.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (key, e) => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    handleFile(key, file)
  }

  const handleAnalyze = async () => {
    const uploaded = Object.values(images).filter(Boolean).length
    if (uploaded === 0) return toast.error('Please upload at least one image to analyze')
    setLoading(true)
    try {
      const res = await analyzeScan({
        left_image: images.left_image || '',
        right_image: images.right_image || '',
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

  const removeImage = key => {
    setImages(prev => ({ ...prev, [key]: null }))
    setPreviews(prev => ({ ...prev, [key]: null }))
  }

  const uploaded = Object.values(images).filter(Boolean).length

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="page-header">
          <h1 className="page-header-title">🔍 Oral Scan</h1>
          <p className="page-header-sub">Upload clear photos of your oral cavity from three angles for AI analysis</p>
        </div>

        {/* Instructions */}
        <div className="alert alert-info mb-3">
          <span>💡</span>
          <span>For best results: Use good lighting, keep camera steady, and open mouth wide. Avoid blurry or dark images.</span>
        </div>

        {/* Upload Grid */}
        <div className="scan-grid">
          {VIEWS.map(view => (
            <div key={view.key}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{view.icon} {view.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{view.desc}</div>
              </div>

              {previews[view.key] ? (
                <div style={{ position: 'relative' }}>
                  <img src={previews[view.key]} alt={view.label} className="upload-preview"
                    style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 'var(--radius)', border: '2px solid var(--primary)' }} />
                  <button onClick={() => removeImage(view.key)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>
                    ✕
                  </button>
                  <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: 'var(--success)' }}>✓ Image uploaded</div>
                </div>
              ) : (
                <div
                  className={`upload-area ${dragOver === view.key ? 'dragover' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(view.key) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(view.key, e)}
                  onClick={() => inputRefs.current[view.key]?.click()}
                >
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Drop image here</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>or click to browse</div>
                  <button type="button" className="btn btn-secondary btn-sm">Choose File</button>
                  <input ref={el => inputRefs.current[view.key] = el} type="file"
                    accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFile(view.key, e.target.files[0])} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="card mt-3" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 12, fontSize: 15, color: 'var(--text-muted)' }}>
            {uploaded} of 2 images uploaded
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ height: '100%', width: `${(uploaded / 2) * 100}%`, background: 'var(--gradient)', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
          <button onClick={handleAnalyze} className="btn btn-primary btn-lg" disabled={loading || uploaded === 0}
            style={{ minWidth: 220 }}>
            {loading ? (
              <><div className="spinner" />&nbsp;Analyzing with AI...</>
            ) : (
              '🤖 Analyze Images'
            )}
          </button>
          {uploaded === 0 && <p className="text-muted mt-2" style={{ fontSize: 13 }}>Upload at least one image to begin analysis</p>}
        </div>
      </div>
    </div>
  )
}
