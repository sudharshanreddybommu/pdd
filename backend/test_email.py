import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

EMAIL_USER = 'sudharshanreddybommu2@gmail.com'
EMAIL_PASS = 'yugq elhc azrr voik'

msg = MIMEMultipart('alternative')
msg['From'] = 'OralScan AI <' + EMAIL_USER + '>'
msg['To'] = EMAIL_USER
msg['Subject'] = 'OralScan AI - OTP Test Email'
body = """
<html>
<body style="font-family:Arial;background:#0f172a;padding:20px;">
  <div style="max-width:400px;margin:auto;background:#1e293b;border-radius:12px;padding:30px;text-align:center;border:1px solid #334155;">
    <h2 style="color:#0ea5e9;">OralScan AI</h2>
    <p style="color:#94a3b8;">Test OTP Email</p>
    <div style="background:#0f172a;border:2px dashed #0ea5e9;border-radius:10px;padding:20px;margin:20px 0;">
      <span style="font-size:36px;font-weight:900;letter-spacing:12px;color:#0ea5e9;font-family:monospace;">123456</span>
    </div>
    <p style="color:#64748b;font-size:12px;">Gmail SMTP is working correctly!</p>
  </div>
</body>
</html>
"""
msg.attach(MIMEText(body, 'html'))

try:
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(EMAIL_USER, EMAIL_PASS)
    server.sendmail(EMAIL_USER, EMAIL_USER, msg.as_string())
    server.quit()
    print('SUCCESS - Test email sent to ' + EMAIL_USER)
except Exception as e:
    print('FAILED - ' + str(e))
