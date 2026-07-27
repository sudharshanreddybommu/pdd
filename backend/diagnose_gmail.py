import smtplib
from email.mime.text import MIMEText
import sys

EMAIL_USER = "sudharshanreddybommu2@gmail.com"
EMAIL_PASS = "uoddwxjfseaqshyb"

print("--- DIAGNOSING GMAIL SMTP DELIVERABILITY ---")

msg = MIMEText("OralScan AI Test OTP: 888999")
msg["From"] = f"OralScan AI <{EMAIL_USER}>"
msg["To"] = EMAIL_USER
msg["Subject"] = "OralScan AI Diagnostic Test OTP"

try:
    print("Connecting to smtp.gmail.com:587 with debug output...")
    server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
    server.set_debuglevel(1)
    server.starttls()
    print("Logging into Gmail...")
    server.login(EMAIL_USER, EMAIL_PASS)
    print("Sending mail...")
    res = server.sendmail(EMAIL_USER, [EMAIL_USER], msg.as_string())
    server.quit()
    print("SUCCESS! SMTP Sendmail returned:", res)
except Exception as e:
    print("FAILED with Exception:", type(e), e)
