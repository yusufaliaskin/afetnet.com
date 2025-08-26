import nodemailer from 'nodemailer';

// E-posta yapılandırması
const createTransporter = () => {
  // Geliştirme ortamı için Ethereal Email kullan
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_EMAIL || 'ethereal.user@ethereal.email',
        pass: process.env.ETHEREAL_PASSWORD || 'ethereal.pass'
      }
    });
  }

  // Prodüksiyon ortamı için gerçek SMTP ayarları
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// E-posta gönderme fonksiyonu
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@afetnet.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // HTML'den text oluştur
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to,
      subject
    });

    // Geliştirme ortamında preview URL'sini göster
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null
    };

  } catch (error) {
    console.error('Email send error:', error);
    throw new Error(`E-posta gönderilemedi: ${error.message}`);
  }
};

// Şifre sıfırlama e-postası şablonu
export const sendPasswordResetEmail = async (email, resetCode, firstName) => {
  const subject = 'Şifre Sıfırlama Kodu - AfetNet';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifre Sıfırlama</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #6B73FF 0%, #9644FF 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
            }
            .code-container {
                background: #f8f9fa;
                border: 2px dashed #6B73FF;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .reset-code {
                font-size: 36px;
                font-weight: bold;
                color: #6B73FF;
                letter-spacing: 8px;
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 10px 10px;
                border: 1px solid #e0e0e0;
                border-top: none;
                font-size: 12px;
                color: #666;
            }
            .button {
                display: inline-block;
                background: #6B73FF;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Şifre Sıfırlama</h1>
            <p>AfetNet Güvenlik Sistemi</p>
        </div>
        
        <div class="content">
            <h2>Merhaba ${firstName || 'Değerli Kullanıcı'},</h2>
            
            <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki 5 haneli doğrulama kodunu kullanarak yeni şifrenizi belirleyebilirsiniz:</p>
            
            <div class="code-container">
                <p style="margin: 0; font-size: 14px; color: #666;">Doğrulama Kodunuz</p>
                <h1 class="reset-code">${resetCode}</h1>
                <p style="margin: 0; font-size: 12px; color: #999;">Bu kodu uygulamada girin</p>
            </div>
            
            <div class="warning">
                <strong>⚠️ Önemli Güvenlik Bilgileri:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Bu kod <strong>15 dakika</strong> boyunca geçerlidir</li>
                    <li>Kodu kimseyle paylaşmayın</li>
                    <li>Bu isteği siz yapmadıysanız, hesabınızın güvenliği için şifrenizi değiştirin</li>
                </ul>
            </div>
            
            <p>Kod çalışmıyor mu? Yeni bir kod talep edebilir veya bizimle iletişime geçebilirsiniz.</p>
            
            <p style="margin-top: 30px;">
                <strong>AfetNet Ekibi</strong><br>
                <small>Güvenliğiniz bizim önceliğimiz</small>
            </p>
        </div>
        
        <div class="footer">
            <p>Bu e-posta AfetNet tarafından otomatik olarak gönderilmiştir.</p>
            <p>© 2024 AfetNet. Tüm hakları saklıdır.</p>
            <p>Bu e-postayı almak istemiyorsanız, hesap ayarlarınızdan bildirim tercihlerinizi güncelleyebilirsiniz.</p>
        </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject,
    html
  });
};

export default {
  sendEmail,
  sendPasswordResetEmail
};