import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def gui_email(email, link):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    # Tạo đối tượng SMTP
    smtp_obj = smtplib.SMTP(smtp_server, smtp_port)

    # Bắt đầu kết nối TLS (nếu máy chủ hỗ trợ)
    smtp_obj.starttls()

    # Đăng nhập vào tài khoản email của bạn
    smtp_username = "phuongthaoksnb5@gmail.com"
    smtp_password = "esojbzvwnqlohgsf"
    smtp_obj.login(smtp_username, smtp_password)


    # Tạo đối tượng MIMEMultipart để chứa nội dung email
    email_message = MIMEMultipart()

    # Thêm thông tin về người gửi, người nhận và chủ đề
    email_message["From"] = "phuongthaoksnb5@gmail.com"
    email_message["To"] = email
    email_message["Subject"] = "Khôi phục mật khẩu"

    # Thêm nội dung email
    email_message.attach(MIMEText(f"""
        Vui lòng nhấp vào link dưới để khôi phục mật khẩu
        {link}
    """, "plain"))

    # Gửi email
    smtp_obj.send_message(email_message)

    # Đóng kết nối SMTP
    smtp_obj.quit()
