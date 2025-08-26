import axios from 'axios';

// Kandilli Rasathanesi API - Ücretsiz ve canlı güncellenen
const KANDILLI_LIVE_API = 'https://api.orhanaydogdu.com.tr/deprem/kandilli/live';
const KANDILLI_ARCHIVE_API = 'https://api.orhanaydogdu.com.tr/deprem/kandilli/archive';
const KANDILLI_API_URL = 'http://www.koeri.boun.edu.tr/scripts/lst0.asp';

class EarthquakeService {
  constructor() {
    // AFAD API client kaldırıldı, sadece Kandilli kullanılıyor
  }

  /**
   * AFAD API için tarih formatı: YYYY-MM-DD HH:mm:ss
   */
  formatDate(date) {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0') + ' ' + 
           String(date.getHours()).padStart(2, '0') + ':' + 
           String(date.getMinutes()).padStart(2, '0') + ':' + 
           String(date.getSeconds()).padStart(2, '0');
  }



  /**
   * Kandilli Rasathanesi Live API'sinden canlı deprem verilerini çeker
   * @param {number} limit - Getirilecek deprem sayısı
   * @returns {Promise<Array>} Deprem verileri dizisi
   */
  async getKandilliLiveEarthquakes(limit = 50) {
    try {
      console.log('Kandilli Rasathanesi Live API\'sinden veri çekiliyor...');
      
      const response = await axios.get(KANDILLI_LIVE_API, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AfetNet Mobile App'
        }
      });

      if (response.data && response.data.result && Array.isArray(response.data.result)) {
        console.log('Kandilli Live API\'sinden başarıyla veri alındı:', response.data.result.length, 'deprem');
        
        const limitedData = response.data.result.slice(0, limit);
        return this.formatKandilliLiveData(limitedData);
      }
      
      throw new Error('Kandilli Live API\'den veri alınamadı');
    } catch (error) {
      console.error('Kandilli Live API bağlantı hatası:', error.message);
      // Fallback olarak eski Kandilli API'sini dene
      return this.getKandilliEarthquakesFallback(limit);
    }
  }

  /**
   * Kandilli Rasathanesi'nden deprem verilerini çeker (Fallback method)
   * @param {number} limit - Getirilecek deprem sayısı
   * @returns {Promise<Array>} Deprem verileri dizisi
   */
  async getKandilliEarthquakesFallback(limit = 50) {
    try {
      console.log('Kandilli Rasathanesi HTML API\'sinden veri çekiliyor (fallback)...');
      
      // Kandilli API'sinden HTML formatında veri çek
      const response = await axios.get(KANDILLI_API_URL, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (response.data) {
        const earthquakes = this.parseKandilliData(response.data, limit);
        console.log('Kandilli API\'sinden başarıyla veri alındı:', earthquakes.length, 'deprem');
        return earthquakes;
      }
      
      throw new Error('Kandilli API\'den veri alınamadı');
    } catch (error) {
      console.error('Kandilli API bağlantı hatası:', error.message);
      throw error;
    }
  }

  /**
   * Kandilli HTML verisini parse eder
   * @param {string} htmlData - HTML formatındaki veri
   * @param {number} limit - Maksimum deprem sayısı
   * @returns {Array} Formatlanmış deprem verileri
   */
  parseKandilliData(htmlData, limit = 50) {
    try {
      const earthquakes = [];
      const lines = htmlData.split('\n');
      let dataStarted = false;
      
      for (let i = 0; i < lines.length && earthquakes.length < limit; i++) {
        const line = lines[i].trim();
        
        // Veri başlangıcını bul
        if (line.includes('Tarih      Saat      Enlem(N)  Boylam(E)')) {
          dataStarted = true;
          continue;
        }
        
        if (!dataStarted || line.length < 50) continue;
        
        // Veri satırını parse et
        const match = line.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{2}:\d{2}:\d{2})\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.-]+)\s+([\d\.-]+)\s+([\d\.-]+)\s+(.+?)\s+(\w+)$/);
        
        if (match) {
          const [, date, time, latitude, longitude, depth, md, ml, mw, location, quality] = match;
          
          // Büyüklük değerini belirle (ML > MW > MD önceliği)
          let magnitude = 0;
          if (ml && ml !== '-.-' && parseFloat(ml) > 0) {
            magnitude = parseFloat(ml);
          } else if (mw && mw !== '-.-' && parseFloat(mw) > 0) {
            magnitude = parseFloat(mw);
          } else if (md && md !== '-.-' && parseFloat(md) > 0) {
            magnitude = parseFloat(md);
          }
          
          if (magnitude > 0) {
            const eventTime = new Date(`${date.replace(/\./g, '-')}T${time}`);
            
            earthquakes.push({
              id: `kandilli_${date}_${time}_${latitude}_${longitude}`,
              magnitude: magnitude,
              location: location.trim(),
              depth: parseFloat(depth) || 0,
              time: eventTime,
              coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
              },
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              source: 'Kandilli Rasathanesi',
              severity: this.calculateSeverity(magnitude),
              distance: this.formatTimeAgo(eventTime),
              region: location.trim(),
              color: this.getSeverityColor(magnitude),
              isAftershock: magnitude < 4.0,
              type: magnitude < 4.0 ? 'Artçı Deprem' : 'Ana Deprem',
              quality: quality,
              formattedTime: eventTime.toLocaleString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }),
              formattedDate: eventTime.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            });
          }
        }
      }
      
      return earthquakes;
    } catch (error) {
      console.error('Kandilli veri parse hatası:', error);
      return [];
    }
  }

  /**
   * Kandilli Live API verilerini formatlar
   * @param {Array} rawData - Ham API verisi
   * @returns {Array} Formatlanmış deprem verileri
   */
  formatKandilliLiveData(rawData) {
    try {
      return rawData.map((earthquake, index) => {
        const eventTime = new Date(earthquake.date_time || earthquake.date);
        const magnitude = parseFloat(earthquake.mag || earthquake.magnitude || 0);
        const depth = parseFloat(earthquake.depth || 0);
        const coordinates = earthquake.geojson?.coordinates || [0, 0];
        const longitude = parseFloat(coordinates[0]);
        const latitude = parseFloat(coordinates[1]);
        
        return {
          id: earthquake.earthquake_id || `kandilli_${index}_${Date.now()}`,
          magnitude: magnitude,
          location: earthquake.title || 'Bilinmeyen Konum',
          time: eventTime,
          depth: depth,
          coordinates: {
            latitude: latitude,
            longitude: longitude
          },
          latitude: latitude,
          longitude: longitude,
          source: 'Kandilli Rasathanesi',
          provider: earthquake.provider || 'kandilli',
          severity: this.calculateSeverity(magnitude),
          distance: this.formatTimeAgo(eventTime),
          region: earthquake.title || 'Bilinmeyen Bölge',
          color: this.getSeverityColor(magnitude),
          isAftershock: magnitude < 4.0,
          type: magnitude < 4.0 ? 'Artçı Deprem' : 'Ana Deprem',
          quality: 'A', // Kandilli verisi genelde kaliteli
          formattedTime: eventTime.toLocaleString('tr-TR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          formattedDate: eventTime.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          locationProperties: earthquake.location_properties,
          closestCity: earthquake.location_properties?.closestCity?.name,
          epiCenter: earthquake.location_properties?.epiCenter?.name,
          rev: earthquake.rev,
          created_at: earthquake.created_at
        };
      });
    } catch (error) {
      console.error('Kandilli Live veri formatı hatası:', error);
      return [];
    }
  }

  /**
   * Son deprem verilerini getirir (sadece Kandilli API'lerini kullanır)
   * @param {number} limit - Getirilecek deprem sayısı (varsayılan: 50)
   * @param {number} minMagnitude - Minimum büyüklük (varsayılan: 0)
   * @returns {Promise<Array>} Deprem verileri dizisi
   */
  async getLatestEarthquakes(limit = 50, minMagnitude = 0) {
    try {
      // 1. Öncelik: Kandilli Rasathanesi Live API
      console.log('Ana kaynak Kandilli Rasathanesi deneniyor...');
      try {
        const kandilliData = await this.getKandilliLiveEarthquakes(limit);
        
        if (kandilliData && kandilliData.length > 0) {
          // Minimum büyüklük filtresi uygula
          const filteredData = kandilliData.filter(earthquake => 
            earthquake.magnitude >= minMagnitude
          );
          
          if (filteredData.length > 0) {
            console.log('Kandilli Rasathanesi verisi kullanılıyor:', filteredData.length, 'deprem');
            return filteredData;
          }
        }
      } catch (kandilliError) {
        console.log('Kandilli API başarısız:', kandilliError.message);
      }
      
      // 2. Yedek Kaynak: Kandilli Fallback (HTML parsing)
      console.log('Yedek kaynak Kandilli Fallback deneniyor...');
      try {
        const fallbackData = await this.getKandilliEarthquakesFallback(limit);
        
        if (fallbackData && fallbackData.length > 0) {
          const filteredData = fallbackData.filter(earthquake => 
            earthquake.magnitude >= minMagnitude
          );
          
          if (filteredData.length > 0) {
            console.log('Kandilli Fallback verisi kullanılıyor:', filteredData.length, 'deprem');
            return filteredData;
          }
        }
      } catch (fallbackError) {
        console.log('Kandilli Fallback başarısız:', fallbackError.message);
      }
      
      // Tüm Kandilli kaynakları başarısız
      throw new Error('Tüm Kandilli veri kaynakları başarısız oldu');
      
    } catch (error) {
      console.error('Tüm Kandilli API\'leri başarısız:', error.message);
      
      // Gerçek API hatası durumunda hata fırlat
      throw new Error('Veriler çekilemiyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
    }
  }

  /**
   * Gerçekçi mock deprem verileri üretir
   * @param {number} limit - Üretilecek deprem sayısı
   * @param {number} minMagnitude - Minimum büyüklük
   * @returns {Array} Mock deprem verileri
   */
  generateRealisticMockData(limit, minMagnitude) {
    const turkishCities = [
      { name: 'İSTANBUL', lat: 41.0082, lon: 28.9784 },
      { name: 'ANKARA', lat: 39.9334, lon: 32.8597 },
      { name: 'İZMİR', lat: 38.4192, lon: 27.1287 },
      { name: 'BURSA', lat: 40.1826, lon: 29.0665 },
      { name: 'ANTALYA', lat: 36.8969, lon: 30.7133 },
      { name: 'ADANA', lat: 37.0000, lon: 35.3213 },
      { name: 'KONYA', lat: 37.8667, lon: 32.4833 },
      { name: 'GAZİANTEP', lat: 37.0662, lon: 37.3833 },
      { name: 'ŞANLIURFA', lat: 37.1591, lon: 38.7969 },
      { name: 'KAYSERİ', lat: 38.7312, lon: 35.4787 },
      { name: 'ESKİŞEHİR', lat: 39.7767, lon: 30.5206 },
      { name: 'DİYARBAKIR', lat: 37.9144, lon: 40.2306 },
      { name: 'SAMSUN', lat: 41.2928, lon: 36.3313 },
      { name: 'DENİZLİ', lat: 37.7765, lon: 29.0864 },
      { name: 'MALATYA', lat: 38.3552, lon: 38.3095 },
      { name: 'ERZURUM', lat: 39.9334, lon: 41.2769 },
      { name: 'VAN', lat: 38.4891, lon: 43.4089 },
      { name: 'ELAZIĞ', lat: 38.6748, lon: 39.2226 },
      { name: 'BINGÖL', lat: 38.8845, lon: 40.4957 },
      { name: 'MUŞ', lat: 38.9462, lon: 41.7539 }
    ];

    const mockData = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const city = turkishCities[Math.floor(Math.random() * turkishCities.length)];
      const magnitude = Math.max(minMagnitude, (Math.random() * 4 + 1.5)); // 1.5-5.5 arası
      const timeOffset = Math.random() * 24 * 60 * 60 * 1000; // Son 24 saat içinde
      const eventTime = new Date(now.getTime() - timeOffset);
      
      // Koordinatlara küçük varyasyon ekle
      const latVariation = (Math.random() - 0.5) * 0.5;
      const lonVariation = (Math.random() - 0.5) * 0.5;

      mockData.push({
        properties: {
          mag: parseFloat(magnitude.toFixed(1)),
          eventid: `mock_${Date.now()}_${i}`,
          location: `${city.name} MERKEZ (${city.name})`,
          date: eventTime.toISOString(),
          latitude: city.lat + latVariation,
          longitude: city.lon + lonVariation,
          depth: Math.random() * 20 + 2, // 2-22 km arası derinlik
          type: Math.random() > 0.8 ? 'aftershock' : 'earthquake' // %20 artçı deprem
        }
      });
    }

    return mockData.sort((a, b) => new Date(b.properties.date) - new Date(a.properties.date));
  }





  /**
   * Eski API formatındaki deprem verilerini formatlar (fallback için)
   * @param {Array} rawData - Ham deprem verileri
   * @returns {Array} Formatlanmış deprem verileri
   */
  formatEarthquakeData(rawData) {
    return rawData.map(earthquake => {
      const properties = earthquake.properties;
      
      const magnitude = parseFloat(properties.mag || properties.magnitude) || 0;
      const eventTime = new Date(properties.date || properties.time || properties.eventtime);
      const isAftershock = properties.type === 'aftershock';
      
      return {
        id: properties.eventid || properties.id || Math.random().toString(36).substr(2, 9),
        magnitude: magnitude,
        location: properties.location || properties.place || 'Bilinmeyen Konum',
        depth: parseFloat(properties.depth) || 0,
        time: eventTime,
        coordinates: {
          latitude: parseFloat(properties.latitude) || (earthquake.geometry ? earthquake.geometry.coordinates[1] : 0),
          longitude: parseFloat(properties.longitude) || (earthquake.geometry ? earthquake.geometry.coordinates[0] : 0)
        },
        latitude: parseFloat(properties.latitude) || (earthquake.geometry ? earthquake.geometry.coordinates[1] : 0),
        longitude: parseFloat(properties.longitude) || (earthquake.geometry ? earthquake.geometry.coordinates[0] : 0),
        source: 'Kandilli',
        severity: this.calculateSeverity(magnitude),
        distance: this.formatTimeAgo(eventTime),
        region: properties.region || 'Türkiye',
        color: this.getSeverityColor(magnitude),
        isAftershock: isAftershock,
        type: isAftershock ? 'Artçı Deprem' : 'Ana Deprem',
        formattedTime: eventTime.toLocaleString('tr-TR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        formattedDate: eventTime.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });
  }

  /**
   * Deprem büyüklüğüne göre şiddet seviyesi hesaplar
   * @param {number} magnitude - Deprem büyüklüğü
   * @returns {string} Şiddet seviyesi
   */
  calculateSeverity(magnitude) {
    if (magnitude >= 7.0) return 'Çok Yüksek';
    if (magnitude >= 6.0) return 'Yüksek';
    if (magnitude >= 5.0) return 'Orta';
    if (magnitude >= 4.0) return 'Düşük';
    return 'Çok Düşük';
  }

  /**
   * İki koordinat arasındaki mesafeyi hesaplar (km)
   * @param {number} lat1 - İlk nokta enlemi
   * @param {number} lon1 - İlk nokta boylamı
   * @param {number} lat2 - İkinci nokta enlemi
   * @param {number} lon2 - İkinci nokta boylamı
   * @returns {number} Mesafe (km)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Dereceyi radyana çevirir
   * @param {number} degrees - Derece değeri
   * @returns {number} Radian değeri
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Zamanı "X dakika/saat/gün önce" formatında döndürür
   * @param {Date} date - Deprem zamanı
   * @returns {string} Formatlanmış zaman
   */
  formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} sa önce`;
    return `${diffDays} gün önce`;
  }

  /**
   * Deprem büyüklüğüne göre renk döndürür
   * @param {number} magnitude - Deprem büyüklüğü
   * @returns {string} Renk kodu
   */
  getSeverityColor(magnitude) {
    if (magnitude >= 7.0) return '#FF3B30'; // Kırmızı - Çok Yüksek
    if (magnitude >= 6.0) return '#FF9500'; // Turuncu - Yüksek
    if (magnitude >= 5.0) return '#FFCC00'; // Sarı - Orta
    if (magnitude >= 4.0) return '#34C759'; // Yeşil - Düşük
    return '#007AFF'; // Mavi - Çok Düşük
  }
}

// Singleton instance
const earthquakeService = new EarthquakeService();
export default earthquakeService;