import smtplib
from email.mime.text import MIMEText

EMAIL_USER = "sudharshanreddybommu2@gmail.com"
EMAIL_PASS = "uoddwxjfseaqshyb"

def test_smtp_tls():
    print("Testing SMTP TLS 587...")
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        msg = MIMEText("Test OTP: 123456")
        msg["From"] = EMAIL_USER
        msg["To"] = EMAIL_USER
        msg["Subject"] = "Test OTP"
        server.sendmail(EMAIL_USER, [EMAIL_USER], msg.as_string())
        server.quit()
        print("SMTP TLS 587 Success!")
        return True
    except Exception as e:
        print(f"SMTP TLS 587 Failed: {e}")
        return False

def test_smtp_ssl():
    print("Testing SMTP SSL 465...")
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10)
        server.login(EMAIL_USER, EMAIL_PASS)
        msg = MIMEText("Test OTP: 123456")
        msg["From"] = EMAIL_USER
        msg["To"] = EMAIL_USER
        msg["Subject"] = "Test OTP"
        server.sendmail(EMAIL_USER, [EMAIL_USER], msg.as_string())
        server.quit()
        print("SMTP SSL 465 Success!")
        return True
    except Exception as e:
        print(f"SMTP SSL 465 Failed: {e}")
        return False

if __name__ == "__main__":
    t1 = test_smtp_tls()
    if not t1:
        test_smtp_ssl()
