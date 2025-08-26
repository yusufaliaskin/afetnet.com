import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'E-posta adresi, doğrulama kodu ve yeni şifre gereklidir.'
      });
    }

    // Şifre validasyonu
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır.'
      });
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az bir küçük harf içermelidir.'
      });
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az bir büyük harf içermelidir.'
      });
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az bir rakam içermelidir.'
      });
    }

    // Doğrulama kodunu kontrol et
    const { data: resetCode, error: codeError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .single();

    if (codeError || !resetCode) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz doğrulama kodu.'
      });
    }

    // Kodun süresinin dolup dolmadığını kontrol et
    const now = new Date();
    const expiresAt = new Date(resetCode.expires_at);

    if (now > expiresAt) {
      // Süresi dolmuş kodu sil
      await supabase
        .from('password_reset_codes')
        .delete()
        .eq('id', resetCode.id);

      return res.status(400).json({
        success: false,
        error: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin.'
      });
    }

    // Kullanıcıyı bul
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı.'
      });
    }

    // Şifreyi hashle
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Kullanıcının şifresini güncelle
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Şifre güncellenirken hata oluştu.'
      });
    }

    // Doğrulama kodunu kullanılmış olarak işaretle
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', resetCode.id);

    // Aynı kullanıcının diğer aktif kodlarını sil
    await supabase
      .from('password_reset_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('used', false);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla güncellendi.'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu.'
    });
  }
}