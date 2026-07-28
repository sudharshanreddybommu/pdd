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
    resultsTitle: "Diagnostic & Clinical Report",
    resultsSubtitle: "AI-powered OPMD assessment of your oral cavity scan",
    listenReport: "Listen to Report",
    pauseAudio: "Pause Audio",
    stopAudio: "Stop Audio",
    playingAudio: "Reading Report...",
    aiConfidence: "AI Confidence",
    conditionsFlagged: "Conditions Flagged",
    classesAnalyzed: "Classes Analyzed",
    findingsTitle: "🔬 AI Diagnostic Findings File",
    breakdownTitle: "OPMD Disease Classification Breakdown",
    recommendationsTitle: "💡 Clinical Recommendations & Care File",
    downloadReport: "Download PDF Medical Report",
    openReportModal: "📄 Open Full Diagnostic Document",
    openRecModal: "💡 Open Clinical Recommendations File",
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
    resultsTitle: "రోగనిర్ధారణ & క్లినికల్ నివేదిక",
    resultsSubtitle: "మీ నోటి స్కాన్ యొక్క AI ఆధారిత OPMD వైద్య నివేదిక",
    listenReport: "నివేదిక వినండి",
    pauseAudio: "ఆపండి",
    stopAudio: "ముగించండి",
    playingAudio: "నివేదిక చదువుతోంది...",
    aiConfidence: "AI విశ్వసనీయత",
    conditionsFlagged: "గుర్తించిన సమస్యలు",
    classesAnalyzed: "విశ్లేషించిన రకాలు",
    findingsTitle: "🔬 AI నిర్ధారణ ఫలితాల ఫైల్",
    breakdownTitle: "వ్యాధి రకాల విశ్లేషణ వివరాలు",
    recommendationsTitle: "💡 క్లినికల్ వైద్య సూచనల ఫైల్",
    downloadReport: "వైద్య నివేదిక PDF డౌన్‌లోడ్ చేయండి",
    openReportModal: "📄 పూర్తి నిర్ధారణ పత్రాన్ని తెరవండి",
    openRecModal: "💡 క్లినికల్ సూచనల ఫైల్ చదవండి",
    findDoctors: "డాక్టర్లను సంప్రదించండి",
    newScan: "కొత్త స్కాన్",

    // Chatbot
    chatbotTitle: "ఓరల్‌కేర్ AI సహాయకుడు",
    chatbotSubtitle: "24/7 నోటి ఆరోగ్య సహాయం",
    askPlaceholder: "నోటి ఆరోగ్యం, లక్షణాల గురించి అడగండి...",
    send: "పంపు"
  },
  hi: {
    home: "होम",
    scan: "ओरल स्कैन",
    results: "परिणाम",
    doctors: "डॉक्टर",
    appointments: "अपॉइंटमेंट",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    language: "भाषा",

    scanTitle: "ओरल स्कैन",
    scanSubtitle: "एआई विश्लेषण के लिए 3 कोणों से मौखिक गुहा की स्पष्ट तस्वीरें अपलोड करें",
    step1Title: "चरण 1 — मौखिक छवियां अपलोड करें (3 दृश्य)",
    step1Desc: "पूर्ण कवरेज के लिए बाएं, सामने और दाएं दृश्य की तस्वीरें अपलोड करें।",
    step2Title: "चरण 2 — अपने लक्षणों की रिपोर्ट करें",
    step2Desc: "एआई सटीकता बढ़ाने के लिए वर्तमान लक्षणों पर टैप करें",
    step3Title: "चरण 3 — एआई विश्लेषण चलाएं",
    analyzeBtn: "मौखिक गुहा का विश्लेषण करें",
    analyzing: "एआई द्वारा विश्लेषण किया जा रहा है...",

    mouth_ulcer: "मुंह का छाला",
    white_patch: "सफेद धब्बा",
    red_patch: "लाल धब्बा",
    mouth_pain: "मुंह में दर्द",
    burning_sensation: "जलन की अनुभूति",
    smoking: "धूम्रपान",
    tobacco: "तंबाकू / गुटखा",
    alcohol: "शराब का सेवन",
    swallowing: "निगलने में कठिनाई",

    resultsTitle: "निदान एवं नैदानिक ​​रिपोर्ट",
    resultsSubtitle: "आपकी मौखिक गुहा स्कैन का एआई-संचालित OPMD मूल्यांकन",
    listenReport: "रिपोर्ट सुनें",
    pauseAudio: "विराम",
    stopAudio: "रोकें",
    playingAudio: "रिपोर्ट पढ़ी जा रही है...",
    aiConfidence: "एआई विश्वास",
    conditionsFlagged: "चिह्नित स्थितियां",
    classesAnalyzed: "विश्लेषित वर्ग",
    findingsTitle: "🔬 एआई नैदानिक ​​निष्कर्ष फ़ाइल",
    breakdownTitle: "रोग वर्गीकरण विवरण",
    recommendationsTitle: "💡 नैदानिक ​​सिफारिशें फ़ाइल",
    downloadReport: "मेडिकल रिपोर्ट डाउनलोड करें",
    openReportModal: "📄 पूर्ण नैदानिक ​​दस्तावेज़ खोलें",
    openRecModal: "💡 नैदानिक ​​सिफारिश फ़ाइल पढ़ें",
    findDoctors: "डॉक्टर खोजें",
    newScan: "नया स्कैन",

    chatbotTitle: "ओरलकेयर एआई सहायक",
    chatbotSubtitle: "24/7 मौखिक स्वास्थ्य सहायता",
    askPlaceholder: "मौखिक स्वास्थ्य या लक्षणों के बारे में पूछें...",
    send: "भेजें"
  },
  ta: {
    home: "முகப்பு",
    scan: "வாய்வழி ஸ்கேன்",
    results: "முடிவுகள்",
    doctors: "மருத்துவர்கள்",
    appointments: "முன்பதிவுகள்",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",
    language: "மொழி",

    scanTitle: "வாய்வழி ஸ்கேன்",
    scanSubtitle: "AI பகுப்பாய்விற்கு 3 கோணங்களில் வாய்வழி புகைப்படங்களைப் பதிவேற்றவும்",
    step1Title: "படி 1 — புகைப்படங்களைப் பதிவேற்றவும் (3 கோணங்கள்)",
    step1Desc: "முழுமையான பகுப்பாய்விற்கு இடது, முன் மற்றும் வலது புகைப்படங்களைப் பதிவேற்றவும்.",
    step2Title: "படி 2 — அறிகுறிகளைத் தேர்ந்தெடுக்கவும்",
    step2Desc: "துல்லியத்தை அதிகரிக்க உங்கள் தற்போதைய அறிகுறிகளைத் தட்டவும்",
    step3Title: "படி 3 — AI பகுப்பாய்வைத் தொடங்கவும்",
    analyzeBtn: "வாய்வழி பகுப்பாய்வு செய்க",
    analyzing: "AI பகுப்பாய்வு செய்கிறது...",

    mouth_ulcer: "வாய் புண்",
    white_patch: "வெள்ளை தழும்பு",
    red_patch: "சிவப்பு தழும்பு",
    mouth_pain: "வாய் வலி",
    burning_sensation: "எரிச்சல் உணர்வு",
    smoking: "புகைபிடித்தல்",
    tobacco: "புகையிலை / பாக்கு",
    alcohol: "மது அருந்துதல்",
    swallowing: "விழுங்குவதில் சிரமம்",

    resultsTitle: "நோய் கண்டறிதல் & மருத்துவ அறிக்கை",
    resultsSubtitle: "உங்கள் வாய்வழி ஸ்கேன் AI அடிப்படையிலான மருத்துவ மதிப்பீடு",
    listenReport: "அறிக்கையைக் கேளுங்கள்",
    pauseAudio: "நிறுத்து",
    stopAudio: "முடி",
    playingAudio: "அறிக்கை படிக்கப்படுகிறது...",
    aiConfidence: "AI துல்லியம்",
    conditionsFlagged: "கண்டறியப்பட்ட நிலைகள்",
    classesAnalyzed: "பகுப்பாய்வு செய்யப்பட்ட வகைகள்",
    findingsTitle: "🔬 AI நோய் கண்டறிதல் கோப்பு",
    breakdownTitle: "நோய் வகைப்பாடு விவரங்கள்",
    recommendationsTitle: "💡 மருத்துவப் பரிந்துரைகள் கோப்பு",
    downloadReport: "மருத்துவ அறிக்கையைப் பதிவிறக்கவும்",
    openReportModal: "📄 முழு நோய் கண்டறிதல் ஆவணத்தைத் திறக்கவும்",
    openRecModal: "💡 மருத்துவப் பரிந்துரை கோப்பைப் படிக்கவும்",
    findDoctors: "மருத்துவர்களைக் கண்டறியவும்",
    newScan: "புதிய ஸ்கேன்",

    chatbotTitle: "ஓரல்கேர் AI உதவியாளர்",
    chatbotSubtitle: "24/7 வாய்வழி சுகாதார உதவி",
    askPlaceholder: "வாய்வழி சுகாதாரம் பற்றி கேளுங்கள்...",
    send: "அனுப்பு"
  },
  kn: {
    home: "ಮುಖಪುಟ",
    scan: "ಬಾಯಿ ಸ್ಕ್ಯಾನ್",
    results: "ಫಲಿತಾಂಶಗಳು",
    doctors: "ವೈದ್ಯರು",
    appointments: "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್",
    profile: "ಪ್ರೊಫೈಲ್",
    logout: "ಲಾಗೌಟ್",
    language: "ಭಾಷೆ",

    scanTitle: "ಬಾಯಿ ಸ್ಕ್ಯಾನ್",
    scanSubtitle: "AI ವಿಶ್ಲೇಷಣೆಗಾಗಿ 3 ಕೋನಗಳಿಂದ ಬಾಯಿಯ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    step1Title: "ಹಂತ 1 — ಬಾಯಿಯ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (3 ಕೋನಗಳು)",
    step1Desc: "ಸಂಪೂರ್ಣ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಎಡ, ಮುಂಭಾಗ ಮತ್ತು ಬಲ ಬದಿಯ ಫೋಟೋಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    step2Title: "ಹಂತ 2 — ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    step2Desc: "AI ನಿಖರತೆಯನ್ನು ಹೆಚ್ಚಿಸಲು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳ ಮೇಲೆ ಟ್ಯಾಪ್ ಮಾಡಿ",
    step3Title: "ಹಂತ 3 — AI ವಿಶ್ಲೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ",
    analyzeBtn: "ವಿಶ್ಲೇಷಣೆ ಮಾಡಿ",
    analyzing: "AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...",

    mouth_ulcer: "ಬಾಯಿ ಹುಣ್ಣು",
    white_patch: "ಬಿಳಿ ಕಲೆ",
    red_patch: "ಕೆಂಪು ಕಲೆ",
    mouth_pain: "ಬಾಯಿ ನೋವು",
    burning_sensation: "ಉರಿ ಅನುಭವ",
    smoking: "ಧೂಮಪಾನ",
    tobacco: "ತಂಬಾಕು / ಗುಟ್ಕಾ",
    alcohol: "ಮದ್ಯಪಾನ",
    swallowing: "ನುಂಗಲು ತೊಂದರೆ",

    resultsTitle: "ರೋಗನಿರ್ಣಯ ಮತ್ತು ವೈದ್ಯಕೀಯ ವರದಿ",
    resultsSubtitle: "ನಿಮ್ಮ ಬಾಯಿ ಸ್ಕ್ಯಾನ್‌ನ AI ಆಧಾರಿತ ವೈದ್ಯಕೀಯ ಮೌಲ್ಯಮಾಪನ",
    listenReport: "ವರದಿ ಕೇಳಿ",
    pauseAudio: "ನಿಲ್ಲಿಸಿ",
    stopAudio: "ಮುಕ್ತಾಯ",
    playingAudio: "ವರದಿಯನ್ನು ಓದಲಾಗುತ್ತಿದೆ...",
    aiConfidence: "AI ನಿಖರತೆ",
    conditionsFlagged: "ಗುರುತಿಸಲಾದ ಸಮಸ್ಯೆಗಳು",
    classesAnalyzed: "ವಿಶ್ಲೇಷಿಸಿದ ವಿಭಾಗಗಳು",
    findingsTitle: "🔬 AI ರೋಗನಿರ್ಣಯದ ಸಂಶೋಧನೆಗಳ ಫೈಲ್",
    breakdownTitle: "ರೋಗ ವರ್ಗೀಕರಣ ವಿವರಗಳು",
    recommendationsTitle: "💡 ವೈದ್ಯಕೀಯ ಶಿಫಾರಸುಗಳ ಫೈಲ್",
    downloadReport: "ವೈದ್ಯಕೀಯ ವರದಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    openReportModal: "📄 ಪೂರ್ಣ ರೋಗನಿರ್ಣಯ ದಾಖಲೆಯನ್ನು ತೆರೆಯಿರಿ",
    openRecModal: "💡 ವೈದ್ಯಕೀಯ ಶಿಫಾರಸುಗಳ ಫೈಲ್ ಓದಿ",
    findDoctors: "ವೈದ್ಯರನ್ನು ಹುಡುಕಿ",
    newScan: "ಹೊಸ ಸ್ಕ್ಯಾನ್",

    chatbotTitle: "ಓರಲ್‌ಕೇರ್ AI ಸಹಾಯಕ",
    chatbotSubtitle: "24/7 ಬಾಯಿಯ ಆರೋಗ್ಯ ಸಹಾಯ",
    askPlaceholder: "ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ"
  },
  ml: {
    home: "ഹോം",
    scan: "ഓറൽ സ്കാൻ",
    results: "ഫലങ്ങൾ",
    doctors: "ഡോക്ടർമാർ",
    appointments: "അപ്പോയിന്റ്മെന്റുകൾ",
    profile: "പ്രൊഫൈൽ",
    logout: "ലോഗ്ഔട്ട്",
    language: "ഭാഷ",

    scanTitle: "ഓറൽ സ്കാൻ",
    scanSubtitle: "AI വിശകലനത്തിനായി 3 കോണുകളിൽ നിന്നുള്ള ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക",
    step1Title: "ഘട്ടം 1 — ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക (3 കോണുകൾ)",
    step1Desc: "ഇടത്, മുൻവശം, വലത് കോണുകളിലെ ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക.",
    step2Title: "ഘട്ടം 2 — ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക",
    step2Desc: "കൃത്യത വർദ്ധിപ്പിക്കുന്നതിന് നിങ്ങളുടെ ലക്ഷണങ്ങൾ തിരഞ്ഞെടുക്കുക",
    step3Title: "ഘട്ടം 3 — AI വിശകലനം ആരംഭിക്കുക",
    analyzeBtn: "വിശകലനം ചെയ്യുക",
    analyzing: "AI വിശകലനം ചെയ്യുന്നു...",

    mouth_ulcer: "വായയിലെ അൾസർ",
    white_patch: "വെളുത്ത പാട്",
    red_patch: "ചുവന്ന പാട്",
    mouth_pain: "വായയിലെ വേദന",
    burning_sensation: "എരിച്ചിൽ അനുഭവം",
    smoking: "പുകവലി",
    tobacco: "പുകയില / ഗുഡ്ക",
    alcohol: "മദ്യപാനം",
    swallowing: "വിഴുങ്ങാൻ ബുദ്ധിമുട്ട്",

    resultsTitle: "രോഗനിർണ്ണയവും ക്ലിനിക്കൽ റിപ്പോർട്ടും",
    resultsSubtitle: "നിങ്ങളുടെ സ്കാനിന്റെ AI അധിഷ്ഠിത വിലയിരുത്തൽ",
    listenReport: "റിപ്പോർട്ട് കേൾക്കുക",
    pauseAudio: "നിർത്തുക",
    stopAudio: "അവസാനിപ്പിക്കുക",
    playingAudio: "റിപ്പോർട്ട് വായിക്കുന്നു...",
    aiConfidence: "AI കൃത്യത",
    conditionsFlagged: "കണ്ടെത്തിയ പ്രശ്നങ്ങൾ",
    classesAnalyzed: "വിശകലനം ചെയ്ത വിഭാഗങ്ങൾ",
    findingsTitle: "🔬 AI രോഗനിർണ്ണയ കണ്ടെത്തലുകൾ",
    breakdownTitle: "രോഗ വർഗ്ഗീകരണ വിവരങ്ങൾ",
    recommendationsTitle: "💡 ക്ലിനിക്കൽ നിർദ്ദേശങ്ങളുടെ ഫയൽ",
    downloadReport: "മെഡിക്കൽ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക",
    openReportModal: "📄 പൂർണ്ണ രോഗനിർണ്ണയ രേഖ തുറക്കുക",
    openRecModal: "💡 ക്ലിനിക്കൽ നിർദ്ദേശ ഫയൽ വായിക്കുക",
    findDoctors: "ഡോക്ടർമാരെ കണ്ടെത്തുക",
    newScan: "പുതിയ സ്കാൻ",

    chatbotTitle: "ഓറൽ കെയർ AI സഹായി",
    chatbotSubtitle: "24/7 ആരോഗ്യ പിന്തുണ",
    askPlaceholder: "ആരോഗ്യത്തെക്കുറിച്ച് ചോദിക്കുക...",
    send: "അയക്കുക"
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
