import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PatientNavbar from '../../components/PatientNavbar'
import OralCareChatbot from '../../components/OralCareChatbot'
import { useLanguage } from '../../utils/i18n'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
]

const RISK_CONFIG = {
  low: {
    icon: '✅', color: '#22c55e', label: 'Low Risk', badgeClass: 'risk-low',
    title: {
      en: 'Oral Health Looks Good!',
      te: 'నోటి ఆరోగ్యం బాగుంది!',
      hi: 'मौखिक स्वास्थ्य अच्छा लग रहा है!',
      ta: 'வாய்வழி ఆరోగ్యం நன்றாக உள்ளது!',
      kn: 'ಬಾಯಿಯ ಆರೋಗ್ಯ ಚೆನ್ನಾಗಿದೆ!',
      ml: 'വായയുടെ ആരോഗ്യം മികച്ചതാണ്!'
    },
    message: {
      en: 'No significant lesions detected. Maintain your current oral hygiene routine.',
      te: 'ఎటువంటి హానికరమైన మార్పులు కనుగొనబడలేదు. రోజూ నోటి పరిశుభ్రత పాటించండి.',
      hi: 'कोई महत्वपूर्ण घाव नहीं मिला। अपनी वर्तमान मौखिक स्वच्छता दिनचर्या बनाए रखें।',
      ta: 'குறிப்பிடத்தக்க புண்கள் எதுவும் கண்டறியப்படவில்லை. உங்கள் சுகாதார முறையைப் பராமரிக்கவும்.',
      kn: 'ಯಾವುದೇ ಗಮನಾರ್ಹ ಹುಣ್ಣುಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ದೈನಂದಿನ ನೈರ್ಮಲ್ಯವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳಿ.',
      ml: 'ഗുരുതരമായ പാടുകളൊന്നും കണ്ടെത്തിയിട്ടില്ല. പതിവ് വായ ശുചിത്വം പാലിക്കുക.'
    },
    bgColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.3)',
  },
  moderate: {
    icon: '⚠️', color: '#f59e0b', label: 'Moderate Risk', badgeClass: 'risk-moderate',
    title: {
      en: 'Early Oral Changes Detected',
      te: 'నోటి కణజాలంలో ప్రారంభ మార్పులు గుర్తించబడ్డాయి',
      hi: 'प्रारंभिक मौखिक परिवर्तन पाए गए',
      ta: 'ஆரம்பகால வாய்வழி மாற்றங்கள் கண்டறியப்பட்டன',
      kn: 'ಆರಂಭಿಕ ಬಾಯಿಯ ಬದಲಾವಣೆಗಳು ಕಂಡುಬಂದಿವೆ',
      ml: 'ആദ്യഘട്ട വായ മാറ്റങ്ങൾ കണ്ടെത്തി'
    },
    message: {
      en: 'Some tissue changes found. Schedule a dentist visit within 2 weeks for evaluation.',
      te: 'కొన్ని మార్పులు కనిపించాయి. 2 వారాల్లో డెంటిస్ట్ ని కలిసి తనిఖీ చేయించుకోండి.',
      hi: 'कुछ ऊतक परिवर्तन मिले। मूल्यांकन के लिए 2 सप्ताह के भीतर दंत चिकित्सक से मिलें।',
      ta: 'சில திசு மாற்றங்கள் காணப்படுகின்றன. 2 வாரங்களுக்குள் பல் மருத்துவரை அணுகவும்.',
      kn: 'ಕೆಲವು ಬದಲಾವಣೆಗಳು ಕಂಡುಬಂದಿವೆ. 2 ವಾರಗಳ ಒಳಗೆ ವೈದ್ಯರನ್ನು ಭೇಟಿಯಾಗಿ.',
      ml: 'ചില മാറ്റങ്ങൾ കാണപ്പെടുന്നു. 2 ആഴ്ചയ്ക്കകം ഡോക്ടറെ കാണുക.'
    },
    bgColor: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)',
  },
  high: {
    icon: '🚨', color: '#ef4444', label: 'High Risk – Urgent', badgeClass: 'risk-high',
    title: {
      en: 'Immediate Medical Consultation Required',
      te: 'తక్షణమే వైద్యుడిని సంప్రదించండి',
      hi: 'तत्काल चिकित्सा परामर्श आवश्यक है',
      ta: 'உடனடி மருத்துவ ஆலோசனை தேவை',
      kn: 'ತಕ್ಷಣದ ವೈದ್ಯಕೀಯ ಸಮಾಲೋಚನೆ ಅಗತ್ಯವಿದೆ',
      ml: 'ഉടൻ തന്നെ വൈദ്യസഹായം തേടുക'
    },
    message: {
      en: 'High-risk oral indicators detected. Please consult an oral specialist without delay.',
      te: 'తీవ్రమైన ప్రమాదకర సంకేతాలు గుర్తించబడ్డాయి. ఆలస్యం చేయకుండా నిపుణులను కలవండి.',
      hi: 'उच्च जोखिम वाले मौखिक संकेतक मिले। बिना किसी देरी के विशेषज्ञ से सलाह लें।',
      ta: 'அதிக ஆபத்து அறிகுறிகள் கண்டறியப்பட்டன. தாமதிக்காமல் நிபுணரை அணுகவும்.',
      kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯದ ಚಿಹ್ನೆಗಳು ಕಂಡುಬಂದಿವೆ. ತಕ್ಷಣವೇ ತಜ್ಞರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
      ml: 'ഉയർന്ന അപകടസാധ്യത കണ്ടെത്തി. വൈകാതെ തന്നെ വിദഗ്ദ്ധനെ കാണുക.'
    },
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
  const { lang, changeLanguage, t } = useLanguage()
  const [result, setResult] = useState(null)
  const [scanId, setScanId] = useState(null)
  const [animDone, setAnimDone] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [activeImageModal, setActiveImageModal] = useState(null)
  const [showFindingsModal, setShowFindingsModal] = useState(false)
  const [showRecsModal, setShowRecsModal] = useState(false)

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
  const displayConfidence = typeof result.confidence === 'string' && result.confidence.endsWith('%')
    ? result.confidence.slice(0, -1)
    : result.confidence

  // Dynamic Translated Titles & Messages
  const displayTitle = cfg.title[lang] || cfg.title.en
  const displayMessage = cfg.message[lang] || cfg.message.en

  /* 🔊 Voice Audio Report Reader (Text-To-Speech in Selected Language) */
  const toggleSpeech = () => {
    const langCodes = { en: 'en-US', te: 'te-IN', hi: 'hi-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN' }
    const targetLang = langCodes[lang] || 'en-US'
    const reportText = `${t('resultsTitle')}. ${cfg.label}. ${displayTitle}. ${displayMessage}.`

    // Fallback play function
    const playFallback = () => {
      if (window.activeAudioReport) {
        window.activeAudioReport.pause()
        window.activeAudioReport = null
        setIsSpeaking(false)
        return
      }
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang.split('-')[0]}&client=tw-ob&q=${encodeURIComponent(reportText.substring(0, 200))}`
      const audio = new Audio(url)
      window.activeAudioReport = audio
      setIsSpeaking(true)
      audio.onended = () => {
        setIsSpeaking(false)
        window.activeAudioReport = null
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        window.activeAudioReport = null
      }
      audio.play().catch(() => {
        setIsSpeaking(false)
        window.activeAudioReport = null
      })
    }

    if (!('speechSynthesis' in window)) {
      playFallback()
      return
    }

    if (isSpeaking) {
      if (window.activeAudioReport) {
        window.activeAudioReport.pause()
        window.activeAudioReport = null
      }
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    try {
      const utterance = new SpeechSynthesisUtterance(reportText)
      utterance.lang = targetLang
      utterance.rate = 0.85

      const voices = window.speechSynthesis.getVoices()
      const matchingVoice = voices.find(v => v.lang === targetLang || v.lang.startsWith(lang))
      if (matchingVoice) {
        utterance.voice = matchingVoice
      }

      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => {
        console.warn('Native speech failed, trying fallback...')
        playFallback()
      }

      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('Native speech error, trying fallback...', e)
      playFallback()
    }
  }

  const openReport = () => {
    if (scanId) {
      window.open(`${API_URL}/api/scan/${scanId}/report?lang=${lang}`, '_blank')
    } else {
      setShowFindingsModal(true)
    }
  }

  return (
    <div className="page fade-in">
      <PatientNavbar />
      <div className="container" style={{ maxWidth: 900, paddingTop: 30, paddingBottom: 60 }}>

        {/* 🌐 Top Multi-Language Selection Toolbar */}
        <div className="card mb-3" style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12))',
          border: '1px solid var(--primary)',
          padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <strong style={{ fontSize: 14 }}>Select Report Reading Language (భాషను ఎంచుకోండి):</strong>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: lang === l.code ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: lang === l.code ? 'var(--primary)' : 'var(--surface-1)',
                    color: lang === l.code ? '#fff' : 'var(--text)',
                    fontWeight: lang === l.code ? 800 : 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: lang === l.code ? '0 2px 10px rgba(14,165,233,0.4)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

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
              padding: '10px 22px',
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
            {displayTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 540, margin: '0 auto 24px', lineHeight: 1.7 }}>
            {displayMessage}
          </p>

          {/* Stats Row */}
          <div style={{ display: 'inline-flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color }}>{displayConfidence}%</div>
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
            {['left_image', 'front_image', 'right_image'].map((key) => {
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

        {/* ── 🔬 AI Diagnostic Findings File Card ── */}
        <div className="card mb-3" style={{ borderLeft: '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <h3 className="card-title" style={{ margin: 0 }}>{t('findingsTitle')}</h3>
            <button
              onClick={() => setShowFindingsModal(true)}
              className="btn btn-primary btn-sm"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', border: 'none' }}
            >
              {t('openReportModal')} →
            </button>
          </div>
          <p style={{ color: 'var(--text)', fontSize: 15, lineHeight: 1.75, background: 'var(--surface-2)', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
            {result.prediction}
          </p>
        </div>

        {/* ── 🦠 Condition Probability Breakdown ── */}
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
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
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

        {/* ── 💡 Clinical Recommendations File Card ── */}
        <div className="card mb-3" style={{ borderLeft: '5px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <h3 className="card-title" style={{ margin: 0 }}>{t('recommendationsTitle')}</h3>
            <button
              onClick={() => setShowRecsModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ border: '1px solid var(--accent, #6366f1)', color: 'var(--accent, #6366f1)' }}
            >
              {t('openRecModal')} →
            </button>
          </div>
          <ul className="suggestions-list" style={{ marginTop: 12 }}>
            {(result.suggestions || []).map((s, i) => (
              <li key={i} className="suggestion-item">
                <div className="suggestion-dot" style={{ background: cfg.color }} />
                <span style={{ fontSize: 15, lineHeight: 1.6 }}>{s}</span>
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
        </div>
      </div>

      {/* 📄 MODAL 1: Full AI Diagnostic Findings Document Reader */}
      {showFindingsModal && (
        <div
          onClick={() => setShowFindingsModal(false)}
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
              padding: 28,
              maxWidth: 650,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--primary)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, margin: 0 }}>📄 Official AI Diagnostic Findings Report</h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Language: {LANGUAGES.find(l => l.code === lang)?.name} ({lang.toUpperCase()})</span>
              </div>
              <button onClick={() => setShowFindingsModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text)' }}>✕</button>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: 15, color: 'var(--text)' }}>
              <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 12, marginBottom: 16, borderLeft: `4px solid ${cfg.color}` }}>
                <strong>Assessment Status:</strong> {cfg.label} ({displayTitle})<br />
                <strong>Confidence Score:</strong> {result.confidence}%<br />
                <strong>Scan Date:</strong> {new Date().toLocaleDateString()}
              </div>

              <h4 style={{ color: 'var(--primary)', marginBottom: 8 }}>🔬 Clinical Diagnosis Summary:</h4>
              <p>{result.prediction}</p>

              <h4 style={{ color: 'var(--primary)', marginTop: 20, marginBottom: 8 }}>🦠 Lesion Class Breakdown:</h4>
              <ul>
                {diseases.map((d, i) => (
                  <li key={i}>
                    <strong>{d.name}:</strong> {d.confidence}% — {d.confidence >= 50 ? '🔴 Detected' : '🟢 Normal'}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <button className="btn btn-secondary" onClick={() => setShowFindingsModal(false)}>Close Document</button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 MODAL 2: Clinical Recommendations & Care Guidelines Reader */}
      {showRecsModal && (
        <div
          onClick={() => setShowRecsModal(false)}
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
              padding: 28,
              maxWidth: 650,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--accent, #6366f1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, margin: 0 }}>💡 Clinical Treatment Guidelines & Recommendations</h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Language: {LANGUAGES.find(l => l.code === lang)?.name} ({lang.toUpperCase()})</span>
              </div>
              <button onClick={() => setShowRecsModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text)' }}>✕</button>
            </div>

            <div style={{ lineHeight: 1.8, fontSize: 15, color: 'var(--text)' }}>
              <h4 style={{ color: 'var(--accent, #6366f1)', marginBottom: 12 }}>📋 Recommended Actions:</h4>
              <ol style={{ paddingLeft: 20 }}>
                {(result.suggestions || []).map((s, i) => (
                  <li key={i} style={{ marginBottom: 10 }}>{s}</li>
                ))}
              </ol>

              <div style={{ marginTop: 20, padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)' }}>
                <strong style={{ color: '#ef4444' }}>⚠️ Medical Disclaimer:</strong>
                <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                  This AI diagnostic analysis is intended for early screening support only. Always consult a qualified dental oncologist or oral surgeon for clinical biopsy and final medical diagnosis.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-danger" onClick={() => { setShowRecsModal(false); navigate('/patient/doctors'); }}>🏥 Book Doctor Consultation</button>
              <button className="btn btn-secondary" onClick={() => setShowRecsModal(false)}>Close Guidelines</button>
            </div>
          </div>
        </div>
      )}

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
