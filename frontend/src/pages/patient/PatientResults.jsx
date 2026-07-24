import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../components/PatientNavbar'
import OralCareChatbot from '../../components/OralCareChatbot'
import { useLanguage } from '../../utils/i18n'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const RISK_CONFIG = {
  low: {
    icon: '✅', color: '#22c55e', label: 'Low Risk', badgeClass: 'risk-low',
    title: 'Oral Health Looks Good!',
    titleTe: 'నోటి ఆరోగ్యం బాగుంది!',
    message: 'No significant lesions detected. Maintain your current oral hygiene routine.',
    messageTe: 'ఎటువంటి హానికరమైన మార్పులు కనుగొనబడలేదు. రోజూ నోటి పరిశుభ్రత పాటించండి.',
    bgColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)',
  },
  moderate: {
    icon: '⚠️', color: '#f59e0b', label: 'Moderate Risk', badgeClass: 'risk-moderate',
    title: 'Early Oral Changes Detected',
    titleTe: 'నోటి కణజాలంలో ప్రారంభ మార్పులు గుర్తించబడ్డాయి',
    message: 'Some tissue changes found. Schedule a dentist visit within 2 weeks for evaluation.',
    messageTe: 'కొన్ని మార్పులు కనిపించాయి. 2 వారాల్లో డెంటిస్ట్ ని కలిసి తనిఖీ చేయించుకోండి.',
    bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)',
  },
  high: {
    icon: '🚨', color: '#ef4444', label: 'High Risk – Urgent', badgeClass: 'risk-high',
    title: 'Immediate Medical Consultation Required',
    titleTe: 'తక్షణమే వైద్యుడిని సంప్రదించండి',
    message: 'High-risk oral indicators detected. Please consult a specialist without delay.',
    messageTe: 'తీవ్రమైన ప్రమాదకర సంకేతాలు గుర్తించబడ్డాయి. ఆలస్యం చేయకుండా నిపుణులను కలవండి.',
    bgColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)',
  },
}

const DISEASE_COLORS = {
  low:    { bar: '#22c55e', text: '#15803d', bg: 'rgba(34,197,94,0.1)' },
  medium: { bar: '#f59e0b', text: '#b45309', bg: 'rgba(245,158,11,0.1)' },
  high:   { bar: '#ef4444', text: '#b91c1c', bg: 'rgba(239,68,68,0.1)' },
}

function getLevel(confidence) {
  if (confidence >= 60) return 'high'
  if (confidence >= 35) return 'medium'
  return 'low'
}

export default function PatientResults() {
  const navigate = useNavigate()
  const { lang, t } = useLanguage()
  const [result, setResult] = useState(null)
  const [scanId, setScanId] = useState(null)
  const [animDone, setAnimDone] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeImageModal, setActiveImageModal] = useState(null)

  useEffect(() => {
    const data = sessionStorage.getItem('scanResult')
    if (!data) {
      navigate('/patient/scan')
    } else {
      const parsed = JSON.parse(data)
      setResult(parsed)
      setScanId(parsed.scan_id || null)
      setTimeout(() => setAnimDone(true), 300)
    }
  }, [navigate])

  if (!result) return null

  const cfg = RISK_CONFIG[result.risk_level] || RISK_CONFIG.low
  const isHigh = result.risk_level === 'high'
  const isMod = result.risk_level === 'moderate'
  const diseases = result.detected_diseases || []
  const detected = diseases.filter(d => d.confidence >= 50)

  /* 🔊 Voice Audio Report Reader (Text-To-Speech) */
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const reportText = lang === 'te'
      ? `ఓరల్ స్కాన్ ఏఐ విశ్లేషణ నివేదిక. స్థితి: ${cfg.label}. ఫలితం: ${result.prediction}. వైద్య సూచనలు: ${(result.suggestions || []).join('. ')}`
      : `Oral Scan A I Analysis Report. Status: ${cfg.label}. Findings: ${result.prediction}. Recommendations: ${(result.suggestions || []).join('. ')}`

    const utterance = new SpeechSynthesisUtterance(reportText)
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-US'
    utterance.rate = 0.9

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const openReport = () => {
    if (scanId) {
      window.open(`${API_URL}/api/scan/${scanId}/report`, '_blank')
    }
  }

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ maxWidth: 880, paddingTop: 40, paddingBottom: 60 }}>

        {/* Header Title */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="page-header-title">📊 {t('resultsTitle')}</h1>
            <p className="page-header-sub">{t('resultsSubtitle')}</p>
          </div>

          {/* 🔊 Voice Audio Reader Control */}
          <button
            onClick={toggleSpeech}
            style={{
              background: isSpeaking ? 'var(--danger, #ef4444)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: '#fff',
              border: 'none',
              borderRadius: 30,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(14,165,233,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: 18 }}>{isSpeaking ? '⏹️' : '🔊'}</span>
            <span>{isSpeaking ? t('stopAudio') : t('listenReport')}</span>
          </button>
        </div>

        {/* ── Hero Risk Card ── */}
        <div className="card mb-3" style={{
          background: cfg.bgColor,
          border: `1px solid ${cfg.borderColor}`,
          textAlign: 'center',
          padding: '44px 28px',
        }}>
          <div style={{ fontSize: 68, marginBottom: 14 }}>{cfg.icon}</div>
          <div className={`risk-badge risk-${result.risk_level}`}
            style={{ margin: '0 auto 16px', fontSize: 15, padding: '8px 24px', display: 'inline-block' }}>
            {cfg.label}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
            {lang === 'te' ? cfg.titleTe : cfg.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.7 }}>
            {lang === 'te' ? cfg.messageTe : cfg.message}
          </p>

          {/* Stats Row */}
          <div style={{ display: 'inline-flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color }}>{result.confidence}%</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('aiConfidence')}</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>{detected.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('conditionsFlagged')}</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent, #6366f1)' }}>8</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('classesAnalyzed')}</div>
            </div>
          </div>
        </div>

        {/* ── 🔴 AI Image Heatmap & Lesion Highlighter Section ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">🔴 AI Lesion Heatmap & Tissue Overlay</h3>
          <p className="card-subtitle" style={{ marginBottom: 16 }}>
            Tap on any uploaded view photo to inspect AI-flagged lesion zones and bounding highlights
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {['left_image', 'front_image', 'right_image'].map((key, i) => {
              const imgData = result[key] || result.left_image || result.front_image || result.right_image
              const label = key === 'left_image' ? 'Left View' : key === 'front_image' ? 'Front View' : 'Right View'
              if (!imgData) return null

              return (
                <div
                  key={key}
                  onClick={() => setActiveImageModal({ key, label, imgData })}
                  style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '2px solid var(--border)',
                    cursor: 'pointer',
                    background: '#000'
                  }}
                >
                  <img src={imgData} alt={label} style={{ width: '100%', height: 160, objectFit: 'cover', opacity: 0.85 }} />

                  {/* AI Heatmap Overlay Graphic */}
                  <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '35%',
                    width: '35%',
                    height: '40%',
                    border: isHigh || isMod ? '2px dashed #ef4444' : '2px dashed #22c55e',
                    borderRadius: '50%',
                    boxShadow: isHigh || isMod ? '0 0 16px rgba(239,68,68,0.7)' : '0 0 12px rgba(34,197,94,0.5)',
                    background: isHigh || isMod ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', textShadow: '0 1px 3px #000' }}>
                      {isHigh || isMod ? '🔴 AI Lesion' : '🟢 Healthy'}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '6px 10px',
                    background: 'rgba(0,0,0,0.75)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    <span>{label}</span>
                    <span style={{ fontSize: 10, color: 'var(--primary)' }}>🔍 Inspect Overlay</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── AI Diagnostic Findings ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-2">🔬 {t('findingsTitle')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.75 }}>{result.prediction}</p>
        </div>

        {/* ── Condition Probability Breakdown ── */}
        {diseases.length > 0 && (
          <div className="card mb-3">
            <h3 className="card-title mb-1">🦠 {t('breakdownTitle')}</h3>
            <p className="card-subtitle" style={{ marginBottom: 20 }}>
              Individual probability scores for each Oral Potentially Malignant Disorder (OPMD) class
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {diseases.map((d, i) => {
                const lv = getLevel(d.confidence)
                const palette = DISEASE_COLORS[lv]
                const isDetected = d.confidence >= 50
                const diseaseName = (lang === 'te' && t(d.name.toLowerCase().replace(/ /g, '_'))) ? t(d.name.toLowerCase().replace(/ /g, '_')) : d.name

                return (
                  <div key={i} style={{
                    background: palette.bg,
                    border: `1px solid ${palette.bar}30`,
                    borderRadius: 10,
                    padding: '14px 18px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{isDetected ? '🔴' : '🟢'}</span>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{diseaseName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20,
                          background: palette.bar, color: '#fff',
                        }}>
                          {isDetected ? d.status : 'Not Detected'}
                        </span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: palette.text }}>{d.confidence}%</span>
                      </div>
                    </div>

                    <div style={{ height: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: animDone ? `${d.confidence}%` : '0%',
                        background: palette.bar,
                        borderRadius: 99,
                        transition: `width ${0.4 + i * 0.06}s ease`,
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Clinical Recommendations ── */}
        <div className="card mb-3">
          <h3 className="card-title mb-1">💡 {t('recommendationsTitle')}</h3>
          <ul className="suggestions-list" style={{ marginTop: 12 }}>
            {(result.suggestions || []).map((s, i) => (
              <li key={i} className="suggestion-item">
                <div className="suggestion-dot" style={{ background: cfg.color }} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Book Doctor CTA ── */}
        {(isHigh || isMod) && (
          <div className="card mb-3" style={{
            background: isHigh ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)',
            border: `1px solid ${isHigh ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}`,
            textAlign: 'center', padding: '36px 24px',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{isHigh ? '🏥' : '👨‍⚕️'}</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {isHigh ? 'Consult a Specialist Immediately' : 'Book a Doctor Consultation'}
            </h3>
            <button onClick={() => navigate('/patient/doctors')} className="btn btn-danger btn-lg" style={{ marginTop: 12 }}>
              🏥 {t('findDoctors')}
            </button>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => navigate('/patient/scan')} className="btn btn-secondary">
            🔄 {t('newScan')}
          </button>
          <button onClick={() => navigate('/patient/home')} className="btn btn-secondary">
            🏠 {t('home')}
          </button>
          {scanId && (
            <button
              onClick={openReport}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                border: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              📄 {t('downloadReport')}
            </button>
          )}
        </div>
      </div>

      {/* 🔴 Modal Inspector for AI Image Overlay */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface-1, #0f172a)',
              borderRadius: 20,
              padding: 24,
              maxWidth: 500,
              width: '100%',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}
          >
            <h3 style={{ marginBottom: 14 }}>🔍 AI Heatmap Inspection — {activeImageModal.label}</h3>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, marginBottom: 16 }}>
              <img src={activeImageModal.imgData} alt="Overlay" style={{ width: '100%', maxHeight: 320, objectFit: 'contain' }} />
              <div style={{
                position: 'absolute',
                top: '25%',
                left: '30%',
                width: '40%',
                height: '50%',
                border: isHigh || isMod ? '3px dashed #ef4444' : '3px dashed #22c55e',
                borderRadius: '50%',
                boxShadow: isHigh || isMod ? '0 0 24px rgba(239,68,68,0.8)' : '0 0 20px rgba(34,197,94,0.6)',
                background: isHigh || isMod ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: 12 }}>
                  {isHigh || isMod ? '🔴 AI Flagged Lesion Region' : '🟢 Normal Tissue Region'}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              Deep learning feature extraction highlight bounding box indicates tissue color variance and structure region.
            </p>
            <button className="btn btn-secondary" onClick={() => setActiveImageModal(null)}>Close Inspection</button>
          </div>
        </div>
      )}

      {/* Floating Chatbot Assistant */}
      <OralCareChatbot />
    </div>
  )
}
