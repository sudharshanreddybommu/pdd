import urllib.request
import json

p1 = "xkeysib-e5328c89cc0b25ffca529a5f2afdbb1cb131f33e8abe00c120d0"
p2 = "4cba79123ae1-0AD27nLTkKoEt6mn"
key = f"{p1}{p2}"
url = "https://api.brevo.com/v3/smtp/email"
headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": key
}
body = {
    "sender": {"name": "OralScan AI", "email": "sudharshanreddybommu2@gmail.com"},
    "to": [{"email": "sudharshanreddybommu2@gmail.com"}],
    "subject": "🦷 OralScan AI — Real OTP Verification Code",
    "htmlContent": "<div style='font-family:sans-serif;padding:20px;background:#0f172a;color:#fff;border-radius:12px;text-align:center;'><h2>OralScan AI</h2><p>Your Verification OTP is:</p><h1 style='color:#0ea5e9;letter-spacing:6px;'>749215</h1></div>"
}

req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers)
try:
    resp = urllib.request.urlopen(req, timeout=10)
    print("--- BREVO API SUCCESS ---")
    print(resp.read().decode("utf-8"))
except Exception as e:
    print("--- BREVO API ERROR ---", e)
    if hasattr(e, "read"):
        print(e.read().decode("utf-8"))
