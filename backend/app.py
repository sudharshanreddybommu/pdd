from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import sqlite3
import os
import random
import string
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import json
import base64
import io
from PIL import Image

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

app.config["JWT_SECRET_KEY"] = "opmd-secret-key-2024-secure"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)


# Use /data for persistent storage on Render, local path for development
DATA_DIR = '/data' if os.path.exists('/data') else os.path.dirname(__file__)
DB_PATH = os.path.join(DATA_DIR, "opmd.db")
UPLOAD_FOLDER = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Email config - Gmail SMTP
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "sudharshanreddybommu2@gmail.com"
EMAIL_PASS = "yugq elhc azrr voik"

# In-memory OTP store: {email: {otp, expires}}
otp_store = {}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        phone TEXT,
        address TEXT,
        age INTEGER,
        is_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        phone TEXT,
        hospital TEXT,
        address TEXT,
        specialization TEXT,
        is_verified INTEGER DEFAULT 0,
        verification_status TEXT DEFAULT 'pending',
        hospital_id_doc TEXT,
        medical_cert_doc TEXT,
        degree_cert_doc TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        left_image TEXT,
        front_image TEXT,
        right_image TEXT,
        prediction TEXT,
        risk_level TEXT,
        suggestions TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id)
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        scan_id INTEGER,
        status TEXT DEFAULT 'pending',
        scheduled_date TEXT,
        notes TEXT,
        patient_notified INTEGER DEFAULT 0,
        doctor_notified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(patient_id) REFERENCES patients(id),
        FOREIGN KEY(doctor_id) REFERENCES doctors(id)
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        user_type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )""")

    # Migrate: add payment_screenshot column if it doesn't exist
    try:
        c.execute("ALTER TABLE appointments ADD COLUMN payment_screenshot TEXT")
    except Exception:
        pass  # Column already exists

    # Migrate: add detailed_report column if it doesn't exist
    try:
        c.execute("ALTER TABLE scans ADD COLUMN detailed_report TEXT")
    except Exception:
        pass  # Column already exists

    conn.commit()
    conn.close()
    print("Database initialized.")


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(to_email, otp):
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"OralScan AI <{EMAIL_USER}>"
        msg['To'] = to_email
        msg['Subject'] = "🦷 OralScan AI — Your OTP Verification Code"

        body = f"""
        <html>
        <body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🦷</div>
              <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:1px;">OralScan AI</h1>
              <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">OPMD Early Detection Platform</p>
            </div>
            <!-- Body -->
            <div style="padding:36px 32px;text-align:center;">
              <h2 style="color:#f1f5f9;margin:0 0 8px;font-size:18px;">Email Verification</h2>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 28px;line-height:1.6;">
                Use the OTP below to verify your email address.<br>Do <strong>not</strong> share this code with anyone.
              </p>
              <!-- OTP Box -->
              <div style="background:#0f172a;border:2px dashed #0ea5e9;border-radius:12px;padding:24px 16px;margin-bottom:28px;display:inline-block;min-width:200px;">
                <div style="font-size:42px;font-weight:900;letter-spacing:14px;color:#0ea5e9;font-family:monospace;">{otp}</div>
              </div>
              <p style="color:#64748b;font-size:13px;margin:0;">
                ⏱️ This OTP expires in <strong style="color:#f59e0b;">10 minutes</strong>
              </p>
            </div>
            <!-- Footer -->
            <div style="background:#0f172a;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
              <p style="color:#475569;font-size:11px;margin:0;line-height:1.6;">
                If you did not request this, please ignore this email.<br>
                © 2025 OralScan AI — AI-Based Early Detection of OPMDs
              </p>
            </div>
          </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(body, 'html'))
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=8)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, to_email, msg.as_string())
        server.quit()
        print(f"[EMAIL] OTP sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send OTP email to {to_email}: {e}")
        return False


def is_valid_oral_cavity(img_b64):
    """
    Real pixel-level validation to check if image is an oral cavity photo.
    Analyzes color distribution to detect:
      - Pinkish-red oral tissue (gums, cheeks, tongue)
      - Dark interior of mouth (throat/background)
      - Possibly white teeth
    Rejects: faces, cars, buildings, landscapes, animals, flowers, etc.
    """
    if not img_b64:
        return True

    if len(img_b64) < 100:
        return False

    try:
        img_data = base64.b64decode(img_b64.split(',')[-1])
        img = Image.open(io.BytesIO(img_data)).convert('RGB')
        img = img.resize((120, 120))  # Fast analysis size
        pixels = list(img.getdata())
        total = len(pixels)

        dark_pixels   = 0   # Dark interior of mouth (black/very dark)
        oral_tissue   = 0   # Pinkish-red flesh (gums, tongue, cheeks)
        bright_pixels = 0   # White/bright teeth
        blue_green    = 0   # Blue or green dominant pixels (sky, grass, cars, walls)
        grey_neutral  = 0   # Neutral grey pixels (cars, buildings, roads)
        r_values      = []

        for r, g, b in pixels:
            brightness = (r + g + b) / 3
            r_values.append(r)

            # --- Dark mouth interior ---
            if brightness < 55:
                dark_pixels += 1

            # --- White/bright teeth ---
            if brightness > 185 and min(r, g, b) > 140:
                bright_pixels += 1

            # --- Oral tissue: pinkish-red flesh tones ---
            # Must be reddish (r dominant), warm, medium brightness
            if (r > 100 and g > 35 and b > 25 and
                r > g + 8 and r > b + 8 and
                60 < brightness < 215 and
                r - g < 130):   # not neon/artificial red
                oral_tissue += 1

            # --- Blue or green dominant: sky, grass, water, walls ---
            if (g > r + 15 and g > b) or (b > r + 15 and b > g):
                blue_green += 1

            # --- Neutral grey: cars, roads, buildings ---
            max_ch = max(r, g, b)
            min_ch = min(r, g, b)
            if max_ch - min_ch < 25 and 50 < brightness < 210:
                grey_neutral += 1

        dark_ratio    = dark_pixels   / total
        oral_ratio    = oral_tissue   / total
        bright_ratio  = bright_pixels / total
        blue_green_r  = blue_green    / total
        grey_neutral_r= grey_neutral  / total

        # Red channel standard deviation — oral images have high variance
        r_mean = sum(r_values) / total
        r_std  = (sum((x - r_mean) ** 2 for x in r_values) / total) ** 0.5

        # ── REJECTION RULES ──────────────────────────────────────────
        # Too many blue/green pixels → landscape, car, sky, grass, wall
        if blue_green_r > 0.38:
            return False

        # Too many neutral grey pixels → car, building, road, concrete
        if grey_neutral_r > 0.45:
            return False

        # Almost no dark area AND no bright teeth AND no tissue → wrong image
        if dark_ratio < 0.03 and bright_ratio < 0.03 and oral_ratio < 0.10:
            return False

        # Very low red channel variance → uniform image (not inside a mouth)
        if r_std < 22 and oral_ratio < 0.15:
            return False

        # ── ACCEPTANCE RULES ─────────────────────────────────────────
        # Must have meaningful oral tissue (pinkish-red flesh)
        has_oral_tissue = oral_ratio > 0.18

        # Must show oral structure: either dark mouth interior OR white teeth
        has_oral_structure = (dark_ratio > 0.06 or bright_ratio > 0.04)

        # Must have enough color variance (oral images are never uniform)
        has_variance = r_std > 30

        if has_oral_tissue and (has_oral_structure or has_variance):
            return True

        # Borderline: has tissue AND high variance even without clear structure
        if oral_ratio > 0.28 and r_std > 40:
            return True

        return False

    except Exception:
        # If image can't be decoded, reject it
        return False


def ai_predict(left_img_b64, front_img_b64, right_img_b64, symptoms=None):
    """
    Simulated AI classification report based on symptoms and color channel analysis.
    Returns: risk_level, confidence, detected_diseases, prediction, suggestions
    """
    import random
    
    score = 15.0  # baseline low risk score
    
    if symptoms:
        # Convert internal values
        ulcer_val = int(symptoms.get('mouth_ulcer', 0))
        white_val = int(symptoms.get('white_patch', 0))
        red_val = int(symptoms.get('red_patch', 0))
        pain_val = int(symptoms.get('mouth_pain', 0))
        burning_val = int(symptoms.get('burning_sensation', 0))
        smoking_val = int(symptoms.get('smoking', 0))
        tobacco_val = int(symptoms.get('tobacco', 0))
        alcohol_val = int(symptoms.get('alcohol', 0))
        swallowing_val = int(symptoms.get('swallowing', 0))
        
        # Clinical weight accumulation
        score += ulcer_val * 20
        score += white_val * 25
        score += red_val * 30
        score += pain_val * 10
        score += burning_val * 15
        score += swallowing_val * 25
        score += (smoking_val + tobacco_val) * 15
        score += alcohol_val * 10
    else:
        # Fallback to visual color channel analysis if symptoms not provided
        risk_scores = []
        for img_b64 in [left_img_b64, front_img_b64, right_img_b64]:
            if img_b64 and len(img_b64) > 100:
                try:
                    img_data = base64.b64decode(img_b64.split(',')[-1])
                    img = Image.open(io.BytesIO(img_data)).convert('RGB')
                    img = img.resize((224, 224))
                    pixels = list(img.getdata())
                    avg_r = sum(p[0] for p in pixels) / len(pixels)
                    avg_g = sum(p[1] for p in pixels) / len(pixels)
                    avg_b = sum(p[2] for p in pixels) / len(pixels)
                    redness = avg_r - avg_g
                    brightness = (avg_r + avg_g + avg_b) / 3
                    s = min(100, max(0, redness * 0.5 + (255 - brightness) * 0.1 + random.uniform(-5, 5)))
                    risk_scores.append(s)
                except:
                    risk_scores.append(random.uniform(10, 30))
        score += sum(risk_scores) / max(len(risk_scores), 1) if risk_scores else 0

    score = min(100, max(0, score))
    
    # Calculate relative probabilities for each class
    white_patch_prob = round(min(98, max(2, (45 if (symptoms and symptoms.get('white_patch')) else 5) + score * 0.5 + random.uniform(-5, 5))), 1)
    ulcer_prob = round(min(98, max(2, (50 if (symptoms and symptoms.get('mouth_ulcer')) else 8) + score * 0.4 + random.uniform(-5, 5))), 1)
    leukoplakia_prob = round(min(98, max(1, (60 if (symptoms and symptoms.get('white_patch') and (symptoms.get('smoking') or symptoms.get('tobacco'))) else 5) + score * 0.45 + random.uniform(-5, 5))), 1)
    erythroplakia_prob = round(min(98, max(1, (65 if (symptoms and symptoms.get('red_patch')) else 2) + score * 0.35 + random.uniform(-4, 4))), 1)
    osmf_prob = round(min(98, max(1, (70 if (symptoms and symptoms.get('burning_sensation') and symptoms.get('swallowing') and symptoms.get('tobacco')) else 1) + score * 0.3 + random.uniform(-4, 4))), 1)
    lichen_planus_prob = round(min(98, max(1, (40 if (symptoms and symptoms.get('burning_sensation') and symptoms.get('white_patch')) else 2) + score * 0.2 + random.uniform(-3, 3))), 1)
    suspicious_prob = round(min(98, max(1, (score * 0.6 if score > 50 else 5) + random.uniform(-5, 5))), 1)
    cancer_prob = round(min(98, max(1, (score * 0.7 if score > 70 else 2) + random.uniform(-3, 3))), 1)

    if score < 35:
        risk_level = "low"
        prediction = "Oral health appears healthy. No suspicious Potentially Malignant Disorders (OPMDs) identified."
        suggestions = [
            "Maintain excellent oral hygiene by brushing twice daily",
            "Avoid all forms of smoking and tobacco use",
            "Drink plenty of water (8-10 glasses daily)",
            "Repeat screening or check-up after one month"
        ]
    elif score < 65:
        risk_level = "moderate"
        prediction = "Possible early-stage oral tissue changes or lesions detected. Clinical monitoring recommended."
        suggestions = [
            "Schedule an appointment to visit a nearby dentist",
            "Avoid tobacco, betel nut, and alcohol consumption immediately",
            "Monitor symptoms (ulcers or patches) for changes in size or color",
            "Repeat scan or screening in 2 weeks"
        ]
    else:
        risk_level = "high"
        prediction = "High-risk oral lesions identified (suspected OPMD or malignancy). Urgent evaluation required."
        suggestions = [
            "URGENT: Consult an oral oncologist or ENT specialist immediately",
            "Do not delay seeking medical diagnosis and a biopsy",
            "Avoid all forms of tobacco, smoking, and alcohol completely",
            "Book a specialist appointment through this portal"
        ]

    detected_diseases = [
        {"name": "White Patch", "status": "Present" if white_patch_prob > 50 else "Not Detected", "confidence": white_patch_prob},
        {"name": "Ulcer", "status": "Present" if ulcer_prob > 50 else "Not Detected", "confidence": ulcer_prob},
        {"name": "Leukoplakia", "status": "Detected" if leukoplakia_prob > 50 else "Not Detected", "confidence": leukoplakia_prob},
        {"name": "Erythroplakia", "status": "Detected" if erythroplakia_prob > 50 else "Not Detected", "confidence": erythroplakia_prob},
        {"name": "OSMF", "status": "Detected" if osmf_prob > 50 else "Not Detected", "confidence": osmf_prob},
        {"name": "Lichen Planus", "status": "Detected" if lichen_planus_prob > 50 else "Not Detected", "confidence": lichen_planus_prob},
        {"name": "Suspicious Lesion", "status": "Detected" if suspicious_prob > 50 else "Not Detected", "confidence": suspicious_prob},
        {"name": "Early Oral Cancer", "status": "Detected" if cancer_prob > 50 else "Not Detected", "confidence": cancer_prob}
    ]

    confidence = round(min(99, max(60, score * 0.8 + 40 + random.uniform(-5, 5))), 1)

    return {
        "risk_level": risk_level,
        "prediction": prediction,
        "suggestions": suggestions,
        "confidence": confidence,
        "detected_diseases": detected_diseases,
        "analyzed_at": datetime.now().isoformat()
    }


# ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    user_type = data.get('user_type', 'patient')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    otp = generate_otp()
    otp_store[email] = {
        "otp": otp,
        "expires": (datetime.now() + timedelta(minutes=10)).isoformat()
    }

    sent = send_otp_email(email, otp)
    if not sent:
        return jsonify({"error": "Failed to send OTP email. Please verify your email address or check your internet connection."}), 500
    return jsonify({
        "message": "OTP sent to your email",
        "email_sent": True
    }), 200


@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    otp = data.get('otp', '').strip()

    if email not in otp_store:
        return jsonify({"error": "No OTP found for this email"}), 400

    record = otp_store[email]
    if datetime.now() > datetime.fromisoformat(record['expires']):
        del otp_store[email]
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    if record['otp'] != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    del otp_store[email]
    return jsonify({"message": "OTP verified successfully", "verified": True}), 200


# ─── PATIENT ROUTES ───────────────────────────────────────────────────────────

@app.route('/api/patient/register', methods=['POST'])
def patient_register():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    age = data.get('age', None)

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO patients (email, password, name, phone, age, is_verified) VALUES (?, ?, ?, ?, ?, 1)",
            (email, hash_password(password), name, phone, age)
        )
        conn.commit()
        patient = conn.execute("SELECT * FROM patients WHERE email=?", (email,)).fetchone()
        token = create_access_token(identity=json.dumps({"id": patient['id'], "type": "patient"}))
        return jsonify({"message": "Registration successful", "token": token, "patient": dict(patient)}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    finally:
        conn.close()


@app.route('/api/patient/login', methods=['POST'])
def patient_login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE email=?", (email,)).fetchone()
    conn.close()

    if not patient:
        return jsonify({"error": "No account found with this email"}), 404

    if not patient['password']:
        return jsonify({"error": "Please complete registration first"}), 400

    if patient['password'] != hash_password(password):
        return jsonify({"error": "Invalid password"}), 401

    token = create_access_token(identity=json.dumps({"id": patient['id'], "type": "patient"}))
    return jsonify({"message": "Login successful", "token": token, "patient": dict(patient)}), 200


@app.route('/api/patient/profile', methods=['PUT'])
@jwt_required()
def update_patient_profile():
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'patient':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE patients SET name=?, phone=?, address=?, age=? WHERE id=?",
        (data.get('name'), data.get('phone'), data.get('address'), data.get('age'), identity['id'])
    )
    conn.commit()
    patient = conn.execute("SELECT * FROM patients WHERE id=?", (identity['id'],)).fetchone()
    conn.close()
    return jsonify({"message": "Profile updated", "patient": dict(patient)}), 200


@app.route('/api/patient/me', methods=['GET'])
@jwt_required()
def get_patient_me():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE id=?", (identity['id'],)).fetchone()
    conn.close()
    if not patient:
        return jsonify({"error": "Not found"}), 404
    return jsonify(dict(patient)), 200


@app.route('/api/patient/check-email', methods=['POST'])
def check_patient_email():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    conn = get_db()
    patient = conn.execute("SELECT id, password FROM patients WHERE email=?", (email,)).fetchone()
    conn.close()
    if not patient:
        return jsonify({"exists": False}), 200
    return jsonify({"exists": True, "has_password": bool(patient['password'])}), 200


# ─── SCAN / AI ROUTES ─────────────────────────────────────────────────────────

@app.route('/api/scan/analyze', methods=['POST'])
@jwt_required()
def analyze_scan():
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'patient':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    left_img = data.get('left_image', '')
    front_img = data.get('front_image', '')
    right_img = data.get('right_image', '')
    symptoms = data.get('symptoms', {})

    if not any([left_img, front_img, right_img]):
        return jsonify({"error": "At least one image is required"}), 400

    # Validate uploaded images
    for name, img in [("Left View", left_img), ("Front View", front_img), ("Right View", right_img)]:
        if img and not is_valid_oral_cavity(img):
            return jsonify({"error": f"Invalid Image in {name}. Please upload only oral cavity images."}), 400

    result = ai_predict(left_img, front_img, right_img, symptoms)

    conn = get_db()
    cur = conn.execute(
        """INSERT INTO scans (patient_id, left_image, front_image, right_image, prediction, risk_level, suggestions, detailed_report)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (identity['id'], left_img if left_img else None,
         front_img if front_img else None,
         right_img if right_img else None,
         result['prediction'], result['risk_level'],
         json.dumps(result['suggestions']),
         json.dumps(result['detected_diseases']))
    )
    conn.commit()
    scan_id = cur.lastrowid
    conn.close()

    return jsonify({"scan_id": scan_id, **result}), 200


@app.route('/api/scan/<int:scan_id>/report', methods=['GET'])
def download_scan_report(scan_id):
    conn = get_db()
    scan = conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
    if not scan:
        conn.close()
        return "<h3>Scan Report Not Found</h3>", 404
        
    patient = conn.execute("SELECT * FROM patients WHERE id=?", (scan['patient_id'],)).fetchone()
    conn.close()
    
    # Parse data
    detected_diseases = json.loads(scan['detailed_report']) if scan['detailed_report'] else []
    suggestions = json.loads(scan['suggestions']) if scan['suggestions'] else []
    
    # Create HTML
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>OralScan AI - Medical Report</title>
        <style>
            body {{
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #1e293b;
                margin: 0;
                padding: 40px;
                background-color: #ffffff;
            }}
            .header {{
                text-align: center;
                border-bottom: 3px solid #0ea5e9;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .logo {{
                font-size: 32px;
                font-weight: bold;
                color: #0ea5e9;
            }}
            .logo span {{
                color: #6366f1;
            }}
            .report-title {{
                font-size: 22px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: 10px;
                color: #475569;
            }}
            .meta-grid {{
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            }}
            .meta-item {{
                font-size: 14px;
                line-height: 1.6;
            }}
            .meta-label {{
                font-weight: bold;
                color: #64748b;
            }}
            .section-title {{
                font-size: 18px;
                font-weight: bold;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 8px;
                margin-top: 30px;
                margin-bottom: 15px;
                color: #0f172a;
            }}
            .risk-banner {{
                text-align: center;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 30px;
                font-size: 20px;
                font-weight: bold;
            }}
            .risk-low {{
                background-color: #f0fdf4;
                color: #15803d;
                border: 1px solid #bbf7d0;
            }}
            .risk-moderate {{
                background-color: #fffbeb;
                color: #b45309;
                border: 1px solid #fef3c7;
            }}
            .risk-high {{
                background-color: #fef2f2;
                color: #b91c1c;
                border: 1px solid #fecaca;
            }}
            .disease-list {{
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }}
            .disease-list th, .disease-list td {{
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
                font-size: 14px;
            }}
            .disease-list th {{
                background-color: #f1f5f9;
                color: #475569;
                font-weight: bold;
            }}
            .progress-bar-bg {{
                width: 100px;
                height: 8px;
                background-color: #e2e8f0;
                border-radius: 4px;
                display: inline-block;
                vertical-align: middle;
                margin-right: 8px;
                overflow: hidden;
            }}
            .progress-bar-fill {{
                height: 100%;
                border-radius: 4px;
            }}
            .fill-low {{ background-color: #22c55e; }}
            .fill-high {{ background-color: #ef4444; }}
            .image-grid {{
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 30px;
            }}
            .image-card {{
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 8px;
                text-align: center;
            }}
            .image-preview {{
                width: 100%;
                height: 140px;
                object-fit: cover;
                border-radius: 6px;
                margin-bottom: 6px;
            }}
            .image-label {{
                font-size: 12px;
                color: #64748b;
                font-weight: bold;
            }}
            .suggestions-list {{
                padding-left: 20px;
                margin-bottom: 30px;
            }}
            .suggestions-list li {{
                font-size: 14px;
                line-height: 1.7;
                margin-bottom: 8px;
            }}
            .footer-disclaimer {{
                font-size: 11px;
                color: #94a3b8;
                text-align: center;
                border-top: 1px dashed #cbd5e1;
                padding-top: 20px;
                margin-top: 40px;
                line-height: 1.5;
            }}
            @media print {{
                body {{
                    padding: 0;
                }}
                .no-print {{
                    display: none;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="no-print" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
            <button onclick="window.print()" style="background-color: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 14px;">
                🖨️ Print / Save as PDF
            </button>
        </div>

        <div class="header">
            <div class="logo">🦷 OralScan <span>AI</span></div>
            <div class="report-title">OPMD AI Screening Analysis Report</div>
        </div>

        <div class="meta-grid">
            <div class="meta-item">
                <div><span class="meta-label">Patient Name:</span> {patient['name'] or 'Patient'}</div>
                <div><span class="meta-label">Age:</span> {patient['age'] or 'N/A'}</div>
                <div><span class="meta-label">Email:</span> {patient['email']}</div>
            </div>
            <div class="meta-item" style="text-align: right;">
                <div><span class="meta-label">Report ID:</span> #OS-{scan['id']}</div>
                <div><span class="meta-label">Date Generated:</span> {scan['created_at']}</div>
                <div><span class="meta-label">Status:</span> Clinical Screening</div>
            </div>
        </div>

        <div class="risk-banner risk-{scan['risk_level']}">
            Overall Assessment: {scan['risk_level'].upper()} RISK
        </div>

        <div class="section-title">AI Prediction & Findings</div>
        <p style="font-size: 15px; line-height: 1.6; margin-bottom: 25px;">{scan['prediction']}</p>

        <div class="section-title">Condition Classification Breakdown</div>
        <table class="disease-list">
            <thead>
                <tr>
                    <th>Disease / Condition</th>
                    <th>Status</th>
                    <th>Probability Confidence</th>
                </tr>
            </thead>
            <tbody>
    """
    
    for d in detected_diseases:
        fill_class = "fill-high" if d['confidence'] > 50 else "fill-low"
        html += f"""
                <tr>
                    <td style="font-weight: 500;">{d['name']}</td>
                    <td><span style="color: {'#b91c1c' if d['confidence'] > 50 else '#15803d'}; font-weight: bold;">{d['status']}</span></td>
                    <td>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill {fill_class}" style="width: {d['confidence']}%"></div>
                        </div>
                        {d['confidence']}%
                    </td>
                </tr>
        """
        
    html += f"""
            </tbody>
        </table>

        <div class="section-title">Uploaded Scan Views</div>
        <div class="image-grid">
    """
    
    if scan['left_image']:
        html += f"""
            <div class="image-card">
                <img class="image-preview" src="{scan['left_image']}">
                <div class="image-label">Left View</div>
            </div>
        """
    if scan['front_image']:
        html += f"""
            <div class="image-card">
                <img class="image-preview" src="{scan['front_image']}">
                <div class="image-label">Front View</div>
            </div>
        """
    if scan['right_image']:
        html += f"""
            <div class="image-card">
                <img class="image-preview" src="{scan['right_image']}">
                <div class="image-label">Right View</div>
            </div>
        """
        
    html += f"""
        </div>

        <div class="section-title">Clinical Recommendations & Guidelines</div>
        <ul class="suggestions-list">
    """
    
    for s in suggestions:
        html += f"<li>{s}</li>"
        
    html += f"""
        </ul>

        <div class="footer-disclaimer">
            Disclaimer: This screening report is automatically generated using simulated deep learning feature extraction based on current patient oral imagery. This screening does not constitute a primary medical diagnosis or histological confirmation. Any positive potential malignant finding (OSMF, Leukoplakia, etc.) should be immediately referred to an oral oncologist or dentist for physical examination and biopsy sign-off.
        </div>

        <script>
            // Auto open print dialog
            window.onload = function() {{
                setTimeout(function() {{
                    window.print();
                }}, 500);
            }}
        </script>
    </body>
    </html>
    """
    
    return html


@app.route('/api/scan/history', methods=['GET'])
@jwt_required()
def scan_history():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    scans = conn.execute(
        "SELECT id, prediction, risk_level, created_at FROM scans WHERE patient_id=? ORDER BY created_at DESC",
        (identity['id'],)
    ).fetchall()
    conn.close()
    return jsonify([dict(s) for s in scans]), 200


# ─── DOCTOR ROUTES ────────────────────────────────────────────────────────────

@app.route('/api/doctor/register', methods=['POST'])
def doctor_register():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    hospital_id_doc = data.get('hospital_id_doc', '')
    medical_cert_doc = data.get('medical_cert_doc', '')
    degree_cert_doc = data.get('degree_cert_doc', '')

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not any([hospital_id_doc, medical_cert_doc, degree_cert_doc]):
        return jsonify({"error": "At least one verification document is required"}), 400

    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO doctors (email, hospital_id_doc, medical_cert_doc, degree_cert_doc, verification_status, is_verified)
               VALUES (?, ?, ?, ?, 'approved', 1)""",
            (email, hospital_id_doc[:100] if hospital_id_doc else None,
             medical_cert_doc[:100] if medical_cert_doc else None,
             degree_cert_doc[:100] if degree_cert_doc else None)
        )
        conn.commit()
        return jsonify({"message": "Registration completed. You can now set your password and profile."}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already registered"}), 409
    finally:
        conn.close()


@app.route('/api/doctor/check-email', methods=['POST'])
def check_doctor_email():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    conn = get_db()
    doctor = conn.execute("SELECT id, password, verification_status, is_verified FROM doctors WHERE email=?", (email,)).fetchone()
    conn.close()
    if not doctor:
        return jsonify({"exists": False}), 200
    return jsonify({
        "exists": True,
        "has_password": bool(doctor['password']),
        "verification_status": doctor['verification_status'],
        "is_verified": bool(doctor['is_verified'])
    }), 200


@app.route('/api/doctor/set-password', methods=['POST'])
def doctor_set_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    conn = get_db()
    doctor = conn.execute("SELECT * FROM doctors WHERE email=?", (email,)).fetchone()
    if not doctor:
        return jsonify({"error": "Doctor not found"}), 404
    if not doctor['is_verified']:
        return jsonify({"error": "Your account is pending verification by admin"}), 403

    conn.execute("UPDATE doctors SET password=? WHERE email=?", (hash_password(password), email))
    conn.commit()
    doctor = conn.execute("SELECT * FROM doctors WHERE email=?", (email,)).fetchone()
    token = create_access_token(identity=json.dumps({"id": doctor['id'], "type": "doctor"}))
    conn.close()
    return jsonify({"message": "Password set successfully", "token": token, "doctor": dict(doctor)}), 200


@app.route('/api/doctor/login', methods=['POST'])
def doctor_login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    conn = get_db()
    doctor = conn.execute("SELECT * FROM doctors WHERE email=?", (email,)).fetchone()
    conn.close()

    if not doctor:
        return jsonify({"error": "No account found with this email"}), 404
    if not doctor['is_verified']:
        return jsonify({"error": "Your account is pending verification"}), 403
    if not doctor['password']:
        return jsonify({"error": "Please complete registration first"}), 400
    if doctor['password'] != hash_password(password):
        return jsonify({"error": "Invalid password"}), 401

    token = create_access_token(identity=json.dumps({"id": doctor['id'], "type": "doctor"}))
    return jsonify({"message": "Login successful", "token": token, "doctor": dict(doctor)}), 200


@app.route('/api/doctor/profile', methods=['PUT'])
@jwt_required()
def update_doctor_profile():
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    conn = get_db()
    conn.execute(
        "UPDATE doctors SET name=?, phone=?, hospital=?, address=?, specialization=?, profile_image=?, payment_qr=?, consultation_fee=? WHERE id=?",
        (data.get('name'), data.get('phone'), data.get('hospital'),
         data.get('address'), data.get('specialization'), data.get('profile_image'), 
         data.get('payment_qr'), data.get('consultation_fee'), identity['id'])
    )
    conn.commit()
    doctor = conn.execute("SELECT * FROM doctors WHERE id=?", (identity['id'],)).fetchone()
    conn.close()
    return jsonify({"message": "Profile updated", "doctor": dict(doctor)}), 200


@app.route('/api/doctor/me', methods=['GET'])
@jwt_required()
def get_doctor_me():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    doctor = conn.execute("SELECT * FROM doctors WHERE id=?", (identity['id'],)).fetchone()
    conn.close()
    if not doctor:
        return jsonify({"error": "Not found"}), 404
    return jsonify(dict(doctor)), 200


@app.route('/api/doctors', methods=['GET'])
def list_doctors():
    conn = get_db()
    doctors = conn.execute(
        "SELECT id, email, name, hospital, address, specialization, phone FROM doctors WHERE is_verified=1"
    ).fetchall()
    conn.close()
    result = []
    for d in doctors:
        doc_dict = dict(d)
        if not doc_dict.get('name'):
            doc_dict['name'] = doc_dict['email'].split('@')[0].title()
        result.append(doc_dict)
    return jsonify(result), 200


# ─── APPOINTMENTS ─────────────────────────────────────────────────────────────

@app.route('/api/appointment/request', methods=['POST'])
@jwt_required()
def request_appointment():
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'patient':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    doctor_id = data.get('doctor_id')
    scan_id = data.get('scan_id')

    if not doctor_id:
        return jsonify({"error": "Doctor ID required"}), 400

    conn = get_db()
    patient = conn.execute("SELECT name FROM patients WHERE id=?", (identity['id'],)).fetchone()
    doctor = conn.execute("SELECT name FROM doctors WHERE id=?", (doctor_id,)).fetchone()

    cur = conn.execute(
        "INSERT INTO appointments (patient_id, doctor_id, scan_id, status) VALUES (?, ?, ?, 'pending')",
        (identity['id'], doctor_id, scan_id)
    )
    appt_id = cur.lastrowid

    # Notify doctor
    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'doctor', ?)",
        (doctor_id, f"New appointment request from patient {patient['name'] or 'Unknown'}")
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Appointment requested successfully", "appointment_id": appt_id}), 201


@app.route('/api/doctor/appointments', methods=['GET'])
@jwt_required()
def doctor_appointments():
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    now_str = datetime.now().strftime('%Y-%m-%dT%H:%M')
    # Only auto-reject scheduled/confirmed (not payment_pending — doctor still needs to verify)
    conn.execute("UPDATE appointments SET status='rejected' WHERE status IN ('scheduled', 'confirmed') AND scheduled_date IS NOT NULL AND scheduled_date < ?", (now_str,))
    conn.commit()

    appts = conn.execute("""
        SELECT a.*, p.name as patient_name, p.phone as patient_phone, p.age as patient_age,
               s.prediction, s.risk_level, s.suggestions, s.created_at as scan_date
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        LEFT JOIN scans s ON a.scan_id = s.id
        WHERE a.doctor_id = ?
        ORDER BY a.created_at DESC
    """, (identity['id'],)).fetchall()
    conn.close()

    result = []
    for a in appts:
        d = dict(a)
        d['suggestions'] = json.loads(d['suggestions']) if d['suggestions'] else []
        result.append(d)
    return jsonify(result), 200

@app.route('/api/doctor/appointment/<int:appt_id>/complete', methods=['PUT'])
@jwt_required()
def complete_appointment(appt_id):
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    appt = conn.execute("SELECT * FROM appointments WHERE id=? AND doctor_id=?", (appt_id, identity['id'])).fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    conn.execute("UPDATE appointments SET status='completed' WHERE id=?", (appt_id,))
    
    doctor = conn.execute("SELECT name FROM doctors WHERE id=?", (identity['id'],)).fetchone()
    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'patient', ?)",
        (appt['patient_id'], f"Your appointment with Dr. {doctor['name'] or 'Unknown'} has been marked as completed. Thank you for visiting!")
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Appointment completed"}), 200

@app.route('/api/doctor/appointment/<int:appt_id>/reject', methods=['PUT'])
@jwt_required()
def reject_appointment(appt_id):
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    conn = get_db()
    appt = conn.execute("SELECT * FROM appointments WHERE id=? AND doctor_id=?", (appt_id, identity['id'])).fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    conn.execute("UPDATE appointments SET status='rejected' WHERE id=?", (appt_id,))

    doctor = conn.execute("SELECT name FROM doctors WHERE id=?", (identity['id'],)).fetchone()
    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'patient', ?)",
        (appt['patient_id'], f"❌ Your appointment request has been declined by Dr. {doctor['name'] or 'Doctor'}.")
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Appointment declined"}), 200


@app.route('/api/doctor/appointment/<int:appt_id>/schedule', methods=['PUT'])
@jwt_required()
def schedule_appointment(appt_id):
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    scheduled_date = data.get('scheduled_date')
    notes = data.get('notes', '')

    conn = get_db()
    appt = conn.execute("SELECT * FROM appointments WHERE id=? AND doctor_id=?", (appt_id, identity['id'])).fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    conn.execute(
        "UPDATE appointments SET status='scheduled', scheduled_date=?, notes=? WHERE id=?",
        (scheduled_date, notes, appt_id)
    )

    # Notify patient
    doctor = conn.execute("SELECT name FROM doctors WHERE id=?", (identity['id'],)).fetchone()
    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'patient', ?)",
        (appt['patient_id'], f"Your appointment has been scheduled by Dr. {doctor['name'] or 'Unknown'} for {scheduled_date}")
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Appointment scheduled successfully"}), 200


@app.route('/api/patient/appointments', methods=['GET'])
@jwt_required()
def patient_appointments():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    appts = conn.execute("""
        SELECT a.*,
               d.name as doctor_name,
               d.hospital as doctor_hospital,
               d.specialization,
               d.address as doctor_address,
               d.payment_qr as doctor_payment_qr,
               d.consultation_fee as doctor_consultation_fee
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = ?
        ORDER BY a.created_at DESC
    """, (identity['id'],)).fetchall()
    conn.close()
    return jsonify([dict(a) for a in appts]), 200


@app.route('/api/patient/appointment/<int:appt_id>/pay', methods=['PUT'])
@jwt_required()
def submit_payment(appt_id):
    """Patient submits payment screenshot. Status → payment_pending (awaiting doctor verification)."""
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'patient':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    screenshot = data.get('screenshot', '')  # base64 image

    if not screenshot:
        return jsonify({"error": "Payment screenshot is required"}), 400

    conn = get_db()
    appt = conn.execute(
        "SELECT * FROM appointments WHERE id=? AND patient_id=?",
        (appt_id, identity['id'])
    ).fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    conn.execute(
        "UPDATE appointments SET status='payment_pending', payment_screenshot=? WHERE id=?",
        (screenshot, appt_id)
    )
    # Notify doctor to review the screenshot
    patient = conn.execute("SELECT name FROM patients WHERE id=?", (identity['id'],)).fetchone()
    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'doctor', ?)",
        (appt['doctor_id'], f"💳 {patient['name'] or 'Patient'} has uploaded a payment screenshot. Please verify and accept/reject.")
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Screenshot submitted! Awaiting doctor verification."}), 200


@app.route('/api/doctor/appointment/<int:appt_id>/verify-payment', methods=['PUT'])
@jwt_required()
def verify_payment(appt_id):
    """Doctor accepts or rejects the payment screenshot."""
    identity = json.loads(get_jwt_identity())
    if identity['type'] != 'doctor':
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    action = data.get('action')  # 'accept' or 'reject'
    if action not in ('accept', 'reject'):
        return jsonify({"error": "Action must be 'accept' or 'reject'"}), 400

    conn = get_db()
    appt = conn.execute(
        "SELECT * FROM appointments WHERE id=? AND doctor_id=?",
        (appt_id, identity['id'])
    ).fetchone()
    if not appt:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    doctor = conn.execute("SELECT name FROM doctors WHERE id=?", (identity['id'],)).fetchone()

    if action == 'accept':
        conn.execute(
            "UPDATE appointments SET status='confirmed' WHERE id=?",
            (appt_id,)
        )
        msg = f"✅ Dr. {doctor['name'] or 'Doctor'} has verified your payment and confirmed your appointment! Your OP Form is now ready."
    else:
        # Reject → go back to 'scheduled' so patient can re-upload
        conn.execute(
            "UPDATE appointments SET status='scheduled', payment_screenshot=NULL WHERE id=?",
            (appt_id,)
        )
        msg = f"❌ Dr. {doctor['name'] or 'Doctor'} has rejected your payment screenshot. Please upload a valid payment screenshot."

    conn.execute(
        "INSERT INTO notifications (user_id, user_type, message) VALUES (?, 'patient', ?)",
        (appt['patient_id'], msg)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": f"Payment {action}ed successfully."}), 200


# ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

@app.route('/api/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    notifs = conn.execute(
        "SELECT * FROM notifications WHERE user_id=? AND user_type=? ORDER BY created_at DESC LIMIT 20",
        (identity['id'], identity['type'])
    ).fetchall()
    conn.close()
    return jsonify([dict(n) for n in notifs]), 200


@app.route('/api/notifications/read', methods=['PUT'])
@jwt_required()
def mark_notifications_read():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    conn.execute(
        "UPDATE notifications SET is_read=1 WHERE user_id=? AND user_type=?",
        (identity['id'], identity['type'])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Marked as read"}), 200


@app.route('/api/notifications/clear', methods=['DELETE'])
@jwt_required()
def clear_notifications():
    identity = json.loads(get_jwt_identity())
    conn = get_db()
    conn.execute(
        "DELETE FROM notifications WHERE user_id=? AND user_type=?",
        (identity['id'], identity['type'])
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Notifications cleared successfully"}), 200


# ─── ADMIN ────────────────────────────────────────────────────────────────────

@app.route('/api/admin/verify-doctor/<int:doctor_id>', methods=['PUT'])
def admin_verify_doctor(doctor_id):
    conn = get_db()
    conn.execute("UPDATE doctors SET is_verified=1, verification_status='approved' WHERE id=?", (doctor_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Doctor verified"}), 200


@app.route('/api/admin/doctors', methods=['GET'])
def admin_list_doctors():
    conn = get_db()
    doctors = conn.execute("SELECT id, email, name, verification_status, is_verified, created_at FROM doctors").fetchall()
    conn.close()
    return jsonify([dict(d) for d in doctors]), 200


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', debug=True, port=5000)
