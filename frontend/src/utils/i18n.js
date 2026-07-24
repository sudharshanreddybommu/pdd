import { useState, useEffect } from 'react'

export const translations = {
  en: {
    // Nav & Common
    home: "Home",
    scan: "Oral Scan",
    results: "Results",
    doctors: "Doctors",
    appointments: "Appointments",
    profile: "Profile",
    logout: "Logout",
    language: "Language",

    // Scan Page
    scanTitle: "Oral Scan",
    scanSubtitle: "Upload clear photos of your oral cavity from 3 views for AI analysis",
    step1Title: "Step 1 — Upload Oral Cavity Images (3 Views)",
    step1Desc: "Upload Left, Front, and Right view photos for complete coverage.",
    step2Title: "Step 2 — Report Your Symptoms",
    step2Desc: "Tap symptoms you are currently experiencing to increase AI accuracy",
    step3Title: "Step 3 — Run AI Analysis",
    analyzeBtn: "Analyze Oral Cavity",
    analyzing: "Analyzing with AI...",

    // Symptoms
    mouth_ulcer: "Mouth Ulcer",
    white_patch: "White Patch",
    red_patch: "Red Patch",
    mouth_pain: "Mouth Pain",
    burning_sensation: "Burning Sensation",
    smoking: "Smoking",
    tobacco: "Tobacco / Betel Nut",
    alcohol: "Alcohol Use",
    swallowing: "Difficulty Swallowing",

    // Results Page
    resultsTitle: "Analysis Results",
    resultsSubtitle: "AI-powered OPMD assessment of your oral cavity scan",
    listenReport: "Listen to Report",
    pauseAudio: "Pause Audio",
    stopAudio: "Stop Audio",
    playingAudio: "Reading Report...",
    aiConfidence: "AI Confidence",
    conditionsFlagged: "Conditions Flagged",
    classesAnalyzed: "Classes Analyzed",
    findingsTitle: "AI Diagnostic Findings",
    breakdownTitle: "Condition Classification Breakdown",
    recommendationsTitle: "Clinical Recommendations",
    downloadReport: "Download Medical Report",
    findDoctors: "Find Doctors",
    newScan: "New Scan",

    // Chatbot
    chatbotTitle: "OralCare AI Assistant",
    chatbotSubtitle: "24/7 Oral Health & OPMD Support",
    askPlaceholder: "Ask about oral health, symptoms, or OPMDs...",
    send: "Send"
  },
  te: {
    // Nav & Common
    home: "హోమ్",
    scan: "ఓరల్ స్కాన్",
    results: "ఫలితాలు",
    doctors: "వైద్యులు",
    appointments: "అపాయింట్‌మెంట్లు",
    profile: "ప్రొఫైల్",
    logout: "లాగౌట్",
    language: "భాష",

    // Scan Page
    scanTitle: "ఓరల్ స్కాన్",
    scanSubtitle: "AI విశ్లేషణ కోసం 3 కోణాల నోటి ఫోటోలను అప్‌లోడ్ చేయండి",
    step1Title: "దశ 1 — నోటి ఫోటోలను అప్‌లోడ్ చేయండి (3 కోణాలు)",
    step1Desc: "ఎడమ, ముందు, మరియు కుడి వైపు ఫోటోలను అప్‌లోడ్ చేయండి.",
    step2Title: "దశ 2 — మీ లక్షణాలను ఎంచుకోండి",
    step2Desc: "AI ఖచ్చితత్వాన్ని పెంచడానికి మీకు ఉన్న లక్షణాలపై టాప్ చేయండి",
    step3Title: "దశ 3 — AI విశ్లేషణ ప్రారంభించండి",
    analyzeBtn: "నోటిని విశ్లేషించండి",
    analyzing: "AI విశ్లేషిస్తోంది...",

    // Symptoms
    mouth_ulcer: "నోటి పుండు",
    white_patch: "తెల్లని మచ్చ",
    red_patch: "ఎర్రని మచ్చ",
    mouth_pain: "నోటి నొప్పులు",
    burning_sensation: "మంట అనుభూతి",
    smoking: "పొగతాగడం",
    tobacco: "తమాకు / గుట్కా",
    alcohol: "మద్యపానం",
    swallowing: "మింగడంలో ఇబ్బంది",

    // Results Page
    resultsTitle: "విశ్లేషణ ఫలితాలు",
    resultsSubtitle: "మీ నోటి స్కాన్ యొక్క AI ఆధారిత OPMD నివేదిక",
    listenReport: "రిపోర్ట్ వినండి",
    pauseAudio: "ఆపండి",
    stopAudio: "ముగించండి",
    playingAudio: "రిపోర్ట్ చదువుతోంది...",
    aiConfidence: "AI విశ్వసనీయత",
    conditionsFlagged: "గుర్తించిన సమస్యలు",
    classesAnalyzed: "విశ్లేషించిన రకాలు",
    findingsTitle: "AI నిర్ధారణ ఫలితాలు",
    breakdownTitle: "వ్యాధి రకాల విభజన",
    recommendationsTitle: "వైద్య సూచనలు",
    downloadReport: "రిపోర్ట్ డౌన్‌లోడ్ చేయండి",
    findDoctors: "డాక్టర్లను వెతకండి",
    newScan: "కొత్త స్కాన్",

    // Chatbot
    chatbotTitle: "ఓరల్‌కేర్ AI సహాయకుడు",
    chatbotSubtitle: "24/7 నోటి ఆరోగ్య సహాయం",
    askPlaceholder: "నోటి ఆరోగ్యం, లక్షణాల గురించి అడగండి...",
    send: "పంపు"
  }
}

export function useLanguage() {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en')

  const changeLanguage = (newLang) => {
    setLang(newLang)
    localStorage.setItem('app_lang', newLang)
    window.dispatchEvent(new Event('languageChange'))
  }

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem('app_lang') || 'en')
    }
    window.addEventListener('languageChange', handleLangChange)
    return () => window.removeEventListener('languageChange', handleLangChange)
  }, [])

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key

  return { lang, changeLanguage, t }
}
