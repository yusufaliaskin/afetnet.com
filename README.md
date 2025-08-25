# AfetLink - Afet Yönetim ve İletişim Uygulaması

**AfetLink**, afet durumlarında güvenli iletişim ve bilgi paylaşımını sağlayan kapsamlı bir mobil uygulamadır. Gerçek zamanlı deprem verileri, aile üyesi takibi, acil durum bildirimleri ve topluluk destekli bilgi paylaşımı özellikleri sunar.

## 🚀 Özellikler

- **Gerçek Zamanlı Deprem Verileri**: Kandilli Rasathanesi ve AFAD verilerinden anlık deprem bilgileri
- **Aile Üyesi Takibi**: Sevdiklerinizin güvenlik durumunu takip edin
- **Acil Durum Bildirimleri**: Kritik durumlarda anında bildirim alın
- **İnteraktif Harita**: Deprem konumları ve güvenlik bölgelerini görüntüleyin
- **Topluluk Paylaşımları**: Kullanıcılar arası bilgi ve deneyim paylaşımı
- **Çok Dilli Destek**: Türkçe ve İngilizce dil seçenekleri
- **Karanlık/Aydınlık Tema**: Kullanıcı tercihine göre tema değiştirme
- **Offline Destek**: İnternet bağlantısı olmadan temel işlevler

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Node.js**: v16.0.0 veya üzeri
- **npm**: v7.0.0 veya üzeri
- **Expo CLI**: v6.0.0 veya üzeri
- **React Native**: v0.72.10

### Mobil Platform Gereksinimleri
- **Android**: API Level 21 (Android 5.0) veya üzeri
- **iOS**: iOS 11.0 veya üzeri
- **Web**: Modern web tarayıcıları (Chrome, Firefox, Safari, Edge)

## 🛠️ Kurulum

### 1. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/afetlink.git
cd afetlink
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın
`.env` dosyasını oluşturun ve gerekli API anahtarlarını ekleyin:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### 4. Supabase Veritabanını Ayarlayın
```bash
# Supabase migrations'ları çalıştırın
npx supabase db reset
```

### 5. Uygulamayı Başlatın

#### Geliştirme Modu
```bash
npm start
```

#### Platform Spesifik Başlatma
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📱 Kullanım Kılavuzu

### İlk Kurulum
1. Uygulamayı açın ve hesap oluşturun
2. Profil bilgilerinizi tamamlayın
3. Konum izinlerini verin
4. Aile üyelerinizi ekleyin

### Ana Özellikler

#### Deprem Takibi
- Ana sayfada son depremleri görüntüleyin
- Harita üzerinde deprem konumlarını inceleyin
- Detaylı deprem bilgilerine erişin

#### Aile Güvenliği
- Aile üyelerinizin güvenlik durumunu kontrol edin
- Acil durumlarda hızlı iletişim kurun
- Konum paylaşımı yapın

#### Topluluk
- Deneyimlerinizi paylaşın
- Diğer kullanıcıların gönderilerini görüntüleyin
- Yardım talep edin veya yardım teklif edin

### Ayarlar
- **Dil**: Türkçe/İngilizce arası geçiş yapın
- **Tema**: Karanlık/Aydınlık tema seçin
- **Bildirimler**: Bildirim tercihlerinizi ayarlayın
- **Gizlilik**: Gizlilik ayarlarınızı yönetin

## 🏗️ Proje Yapısı

```
afetlink/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   ├── contexts/           # React Context providers
│   ├── screens/            # Uygulama ekranları
│   ├── services/           # API servisleri
│   ├── styles/             # Stil dosyaları
│   └── lib/                # Yardımcı kütüphaneler
├── assets/                 # Resim ve medya dosyaları
├── backend/                # Backend API (Next.js)
├── supabase/              # Veritabanı migrations
└── android/               # Android spesifik dosyalar
```

## 🔧 Geliştirme

### Kod Standartları
- **ESLint** ve **Prettier** kullanın
- Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standardını takip edin
- Her özellik için ayrı branch oluşturun

### Test Etme
```bash
# Unit testleri çalıştır
npm test

# E2E testleri çalıştır
npm run test:e2e
```

### Build Alma
```bash
# Android APK
npx expo build:android

# iOS IPA
npx expo build:ios

# Web build
npm run build:web
```

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Katkıda bulunmak için:

1. **Fork** edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. **Pull Request** oluşturun

### Katkı Kuralları
- Kod değişikliklerinden önce issue açın
- Testlerinizi yazın
- Dokümantasyonu güncelleyin
- Code review sürecine katılın

### Bug Raporlama
Bug bulduğunuzda lütfen şunları ekleyin:
- Detaylı açıklama
- Yeniden üretme adımları
- Beklenen ve gerçek davranış
- Ekran görüntüleri (varsa)
- Cihaz/platform bilgileri

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

```
MIT License

Copyright (c) 2024 AfetLink

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 İletişim

- **Proje Sahibi**: [Yusuf Ali Aşkın](mailto:yusufali@example.com)
- **GitHub**: [https://github.com/kullaniciadi/afetlink](https://github.com/kullaniciadi/afetlink)
- **Website**: [https://afetlink.com](https://afetlink.com)
- **Destek**: [support@afetlink.com](mailto:support@afetlink.com)

## 🔄 Sürüm Geçmişi

### v1.0.0 (2024-01-15)
- ✨ İlk stabil sürüm
- 🚀 Temel afet yönetimi özellikleri
- 📱 Android ve iOS desteği
- 🌐 Web platform desteği
- 🌍 Çok dilli destek (TR/EN)

### v0.9.0 (2024-01-01)
- 🧪 Beta sürüm
- 🔧 Performans iyileştirmeleri
- 🐛 Bug düzeltmeleri
- 📊 Analytics entegrasyonu

### v0.8.0 (2023-12-15)
- 🎨 UI/UX iyileştirmeleri
- 🔐 Güvenlik güncellemeleri
- 📡 API optimizasyonları
- 🗺️ Harita özellikleri

---

**Not**: Bu proje aktif olarak geliştirilmektedir. Güncellemeler ve yeni özellikler için [GitHub Releases](https://github.com/kullaniciadi/afetlink/releases) sayfasını takip edin.

## 🙏 Teşekkürler

- [Kandilli Rasathanesi](http://www.koeri.boun.edu.tr/) - Deprem verileri
- [AFAD](https://www.afad.gov.tr/) - Afet yönetimi bilgileri
- [Expo](https://expo.dev/) - Geliştirme platformu
- [Supabase](https://supabase.com/) - Backend servisleri
- [Mapbox](https://www.mapbox.com/) - Harita servisleri

**AfetLink ile güvenli kalın! 🛡️**