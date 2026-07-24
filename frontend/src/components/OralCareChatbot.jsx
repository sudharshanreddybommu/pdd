import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../utils/i18n'

const KNOWLEDGE_BASE = [
  {
    keywords: ['leukoplakia', 'white patch', 'తెల్లని మచ్చ', 'తెల్లమచ్చ'],
    en: "Leukoplakia refers to thick, white patches on the gums, insides of cheeks, or tongue. While many patches are non-cancerous, some show early signs of cancer (OPMD). Avoid tobacco/smoking and consult a dentist for a clinical biopsy.",
    te: "ల్యూకోప్లాకియా అంటే దంతాలు, బుగ్గల లోపలి భాగం లేదా నాలుకపై తెల్లని మచ్చలు ఏర్పడటం. ఇవి పొగాకు వాడుక వల్ల రావచ్చు. వీటిని వెంటనే డెంటిస్ట్ కి చూపించి బయాప్సీ చేయించుకోవడం మంచిది."
  },
  {
    keywords: ['osmf', 'submucous fibrosis', 'mouth opening', 'నోరు తెరుచుకోవడం'],
    en: "Oral Submucous Fibrosis (OSMF) is a chronic disease characterized by burning sensation when eating spicy food and progressive difficulty opening the mouth wide. It is strongly linked to betel nut and chewing tobacco use.",
    te: "ఓరల్ సబ్‌మ్యూకోసస్ ఫైబ్రోసిస్ (OSMF) లో కారం తిన్నప్పుడు నోరు మండటం మరియు నోరు పూర్తిగా తెరవలేకపోవడం జరుగుతుంది. గుట్కా, తమలపాకు, వక్క నమలడం వల్ల ఇది ఎక్కువగా వస్తుంది."
  },
  {
    keywords: ['ulcer', 'canker sore', 'నోటి పుండు', 'పుండు'],
    en: "Oral ulcers that persist for more than 2 weeks without healing require immediate clinical evaluation to rule out Potentially Malignant Disorders (OPMDs) or early oral cancer.",
    te: "2 వారాల కంటే ఎక్కువ రోజులు మానకుండా ఉండే నోటి పుండ్లను తేలికగా తీసుకోకండి. వెంటనే ఓరల్ క్యాన్సర్ స్పెషలిస్ట్ ని సంప్రదించండి."
  },
  {
    keywords: ['doctor', 'consultation', 'appointment', 'డాక్టర్', 'అపాయింట్‌మెంట్'],
    en: "You can book a direct consultation with top oral oncologists and dentists by going to the 'Doctors' tab in the navbar. Select a doctor and choose your appointment slot!",
    te: "మీరు పైన ఉన్న 'Doctors' (వైద్యులు) టాబ్ కి వెళ్లి మీకు కావలసిన స్పెషలిస్ట్ ని ఎంచుకుని నేరుగా అపాయింట్‌మెంట్ బుక్ చేసుకోవచ్చు!"
  },
  {
    keywords: ['scan', 'how to scan', 'स्काँन', 'స్కాన్ ఎలా చేయాలి'],
    en: "To run an AI scan, click 'Oral Scan' in the top navbar. Upload 3 photos (Left view, Front view, Right view), tap your symptoms, and click 'Analyze Oral Cavity'.",
    te: "AI స్కాన్ చేయడం కోసం 'Oral Scan' బటన్ క్లిక్ చేయండి. నోటి ఎడమ, ముందు, మరియు కుడి వైపు ఫోటోలు అప్‌లోడ్ చేసి 'Analyze' క్లిక్ చేయండి."
  }
]

export default function OralCareChatbot() {
  const { lang, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: lang === 'te' 
        ? "నమస్కారం! నేను మీ OralCare AI సహాయకుడిని. నోటి ఆరోగ్యం లేదా ఓరల్ స్కాన్ గురించి ఏమైనా అడగండి."
        : "Hello! I am your OralCare AI Assistant. How can I help you with your oral health today?"
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    // Add user message
    const userMsg = { sender: 'user', text: query }
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInput('')

    // Generate response
    setTimeout(() => {
      const lower = query.toLowerCase()
      let reply = null

      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(kw => lower.includes(kw))) {
          reply = lang === 'te' ? item.te : item.en
          break
        }
      }

      if (!reply) {
        reply = lang === 'te'
          ? "మీ ప్రశ్నకు వివరమైన సమాధానం కోసం దయచేసి మా నైపుణ్యం కలిగిన ఓరల్ ఆంకాలజిస్ట్ ని సంప్రదించండి. లేదా మీరు 'Doctors' టాబ్ నుండి డెంటిస్ట్ ని కలవవచ్చు."
          : "For specific clinical advice regarding your condition, please consult a verified oral oncologist or dentist through our 'Doctors' tab."
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }])
    }, 500)
  }

  const QUICK_QUESTIONS = lang === 'te' ? [
    "తెల్లమచ్చ అంటే ఏమిటి?",
    "OSMF అంటే ఏమిటి?",
    "డాక్టర్ ని ఎలా కలవాలి?",
    "స్కాన్ ఎలా చేయాలి?"
  ] : [
    "What is Leukoplakia?",
    "What is OSMF?",
    "How to book a doctor?",
    "How to run AI scan?"
  ]

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            color: '#fff',
            border: 'none',
            borderRadius: 30,
            padding: '12px 20px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 20 }}>💬</span>
          <span>{t('chatbotTitle')}</span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div style={{
          width: 360,
          maxWidth: '90vw',
          height: 480,
          background: 'var(--surface-1, #0f172a)',
          border: '1px solid var(--border, rgba(255,255,255,0.15))',
          borderRadius: 20,
          boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            padding: '14px 18px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 24 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{t('chatbotTitle')}</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>{t('chatbotSubtitle')}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div style={{
            flex: 1,
            padding: 16,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: 'rgba(0,0,0,0.1)'
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.sender === 'user' ? 'var(--primary, #0ea5e9)' : 'var(--surface-2, #1e293b)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Chips */}
          <div style={{ padding: '8px 12px', background: 'var(--surface-2)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted, #cbd5e1)',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={e => { e.preventDefault(); handleSend() }}
            style={{
              padding: 12,
              background: 'var(--surface-1)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: 8
            }}
          >
            <input
              type="text"
              placeholder={t('askPlaceholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text, #fff)',
                borderRadius: 20,
                padding: '8px 14px',
                fontSize: 13,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--primary, #0ea5e9)',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {t('send')}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
