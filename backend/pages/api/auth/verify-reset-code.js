import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'E-posta adresi ve doğrulama kodu gereklidir.'
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

    res.status(200).json({
      success: true,
      message: 'Doğrulama kodu geçerli.'
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu.'
    });
  }
}