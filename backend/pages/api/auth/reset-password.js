import { createClient } from '@supabase/supabase-js';
import Joi from 'joi';
import { sendPasswordResetEmail } from '../../../lib/services/emailService.js';

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Request body validation
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'Geçerli bir e-posta adresi girin',
        'any.required': 'E-posta adresi gerekli'
      })
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { email } = value;

    // Supabase client oluştur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Kullanıcının sistemde kayıtlı olup olmadığını kontrol et
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // 5 haneli rastgele kod oluştur
    const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Kodun geçerlilik süresi (15 dakika)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Eski kodları temizle (aynı kullanıcı için)
    await supabase
      .from('password_reset_codes')
      .delete()
      .eq('user_id', user.id);

    // Yeni kodu veritabanına kaydet
    const { error: insertError } = await supabase
      .from('password_reset_codes')
      .insert({
        user_id: user.id,
        email: email,
        code: resetCode,
        expires_at: expiresAt.toISOString(),
        used: false
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Kod oluşturulurken bir hata oluştu'
      });
    }

    // E-posta gönderme
    try {
      await sendPasswordResetEmail(user.email, resetCode, user.first_name);
      console.log(`Şifre sıfırlama kodu ${user.email} adresine gönderildi: ${resetCode}`);
    } catch (emailError) {
      console.error('E-posta gönderme hatası:', emailError);
      // E-posta gönderilemese bile kod veritabanına kaydedildi, işleme devam et
    }

    return res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu'
    });
  }
}