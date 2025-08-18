// Afet Veri Servisi - Gerçek zamanlı afet verilerini simüle eder

export const DISASTER_TYPES = {
  EARTHQUAKE: 'earthquake',
  FIRE: 'fire',
  FLOOD: 'flood',
  STORM: 'storm',
  LANDSLIDE: 'landslide'
};

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Türkiye'deki şehirler ve koordinatları
const TURKISH_CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
  { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
  { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
  { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
  { name: 'Adana', lat: 37.0000, lng: 35.3213 },
  { name: 'Konya', lat: 37.8667, lng: 32.4833 },
  { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
  { name: 'Şanlıurfa', lat: 37.1591, lng: 38.7969 },
  { name: 'Kocaeli', lat: 40.8533, lng: 29.8815 },
  { name: 'Mersin', lat: 36.8000, lng: 34.6333 },
  { name: 'Diyarbakır', lat: 37.9144, lng: 40.2306 },
  { name: 'Hatay', lat: 36.4018, lng: 36.3498 },
  { name: 'Manisa', lat: 38.6191, lng: 27.4289 },
  { name: 'Kayseri', lat: 38.7312, lng: 35.4787 },
  { name: 'Samsun', lat: 41.2928, lng: 36.3313 },
  { name: 'Balıkesir', lat: 39.6484, lng: 27.8826 },
  { name: 'Kahramanmaraş', lat: 37.5858, lng: 36.9371 },
  { name: 'Van', lat: 38.4891, lng: 43.4089 },
  { name: 'Aydın', lat: 37.8560, lng: 27.8416 },
  { name: 'Denizli', lat: 37.7765, lng: 29.0864 },
  { name: 'Sakarya', lat: 40.6940, lng: 30.4358 },
  { name: 'Tekirdağ', lat: 40.9833, lng: 27.5167 },
  { name: 'Muğla', lat: 37.2153, lng: 28.3636 },
  { name: 'Eskişehir', lat: 39.7767, lng: 30.5206 },
  { name: 'Malatya', lat: 38.3552, lng: 38.3095 },
  { name: 'Erzurum', lat: 39.9334, lng: 41.2769 },
  { name: 'Trabzon', lat: 41.0015, lng: 39.7178 },
  { name: 'Elazığ', lat: 38.6810, lng: 39.2264 }
];

// Gerçekçi afet verileri oluşturma
class DisasterService {
  constructor() {
    this.activeDisasters = [];
    this.listeners = [];
    this.isRunning = false;
  }

  // Rastgele şehir seç
  getRandomCity() {
    return TURKISH_CITIES[Math.floor(Math.random() * TURKISH_CITIES.length)];
  }

  // Deprem verisi oluştur
  generateEarthquake() {
    const city = this.getRandomCity();
    const magnitude = (Math.random() * 4 + 3).toFixed(1); // 3.0 - 7.0 arası
    const depth = Math.floor(Math.random() * 50 + 5); // 5-55 km arası
    
    let severity = SEVERITY_LEVELS.LOW;
    if (magnitude >= 6.0) severity = SEVERITY_LEVELS.CRITICAL;
    else if (magnitude >= 5.0) severity = SEVERITY_LEVELS.HIGH;
    else if (magnitude >= 4.0) severity = SEVERITY_LEVELS.MEDIUM;

    return {
      id: `earthquake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: DISASTER_TYPES.EARTHQUAKE,
      severity,
      title: `${magnitude} Büyüklüğünde Deprem`,
      location: city.name,
      coordinates: { lat: city.lat, lng: city.lng },
      magnitude: parseFloat(magnitude),
      depth: `${depth} km`,
      timestamp: new Date(),
      description: `${city.name} merkezli ${magnitude} büyüklüğünde deprem meydana geldi. Derinlik: ${depth} km`,
      affectedPopulation: Math.floor(Math.random() * 500000 + 10000),
      status: 'active'
    };
  }

  // Yangın verisi oluştur
  generateFire() {
    const city = this.getRandomCity();
    const fireTypes = ['Orman Yangını', 'Fabrika Yangını', 'Konut Yangını', 'Araç Yangını'];
    const fireType = fireTypes[Math.floor(Math.random() * fireTypes.length)];
    const area = Math.floor(Math.random() * 1000 + 50); // 50-1050 hektar
    
    let severity = SEVERITY_LEVELS.LOW;
    if (area >= 500) severity = SEVERITY_LEVELS.CRITICAL;
    else if (area >= 200) severity = SEVERITY_LEVELS.HIGH;
    else if (area >= 100) severity = SEVERITY_LEVELS.MEDIUM;

    return {
      id: `fire_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: DISASTER_TYPES.FIRE,
      severity,
      title: fireType,
      location: city.name,
      coordinates: { lat: city.lat, lng: city.lng },
      area: `${area} hektar`,
      timestamp: new Date(),
      description: `${city.name} bölgesinde ${fireType.toLowerCase()} başladı. Etkilenen alan: ${area} hektar`,
      affectedPopulation: Math.floor(Math.random() * 100000 + 1000),
      status: 'active'
    };
  }

  // Sel verisi oluştur
  generateFlood() {
    const city = this.getRandomCity();
    const waterLevel = (Math.random() * 3 + 0.5).toFixed(1); // 0.5-3.5 metre
    const rainfall = Math.floor(Math.random() * 150 + 20); // 20-170 mm
    
    let severity = SEVERITY_LEVELS.LOW;
    if (waterLevel >= 2.5) severity = SEVERITY_LEVELS.CRITICAL;
    else if (waterLevel >= 1.5) severity = SEVERITY_LEVELS.HIGH;
    else if (waterLevel >= 1.0) severity = SEVERITY_LEVELS.MEDIUM;

    return {
      id: `flood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: DISASTER_TYPES.FLOOD,
      severity,
      title: 'Sel Felaketi',
      location: city.name,
      coordinates: { lat: city.lat, lng: city.lng },
      waterLevel: `${waterLevel} metre`,
      rainfall: `${rainfall} mm`,
      timestamp: new Date(),
      description: `${city.name} bölgesinde şiddetli yağışlar nedeniyle sel oluştu. Su seviyesi: ${waterLevel} metre`,
      affectedPopulation: Math.floor(Math.random() * 200000 + 5000),
      status: 'active'
    };
  }

  // Fırtına verisi oluştur
  generateStorm() {
    const city = this.getRandomCity();
    const windSpeed = Math.floor(Math.random() * 80 + 40); // 40-120 km/h
    
    let severity = SEVERITY_LEVELS.LOW;
    if (windSpeed >= 100) severity = SEVERITY_LEVELS.CRITICAL;
    else if (windSpeed >= 80) severity = SEVERITY_LEVELS.HIGH;
    else if (windSpeed >= 60) severity = SEVERITY_LEVELS.MEDIUM;

    return {
      id: `storm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: DISASTER_TYPES.STORM,
      severity,
      title: 'Şiddetli Fırtına',
      location: city.name,
      coordinates: { lat: city.lat, lng: city.lng },
      windSpeed: `${windSpeed} km/h`,
      timestamp: new Date(),
      description: `${city.name} bölgesinde ${windSpeed} km/h hızında rüzgar ile şiddetli fırtına etkili oluyor`,
      affectedPopulation: Math.floor(Math.random() * 150000 + 2000),
      status: 'active'
    };
  }

  // Heyelan verisi oluştur
  generateLandslide() {
    const city = this.getRandomCity();
    const volume = Math.floor(Math.random() * 10000 + 500); // 500-10500 m³
    
    let severity = SEVERITY_LEVELS.MEDIUM;
    if (volume >= 5000) severity = SEVERITY_LEVELS.CRITICAL;
    else if (volume >= 2000) severity = SEVERITY_LEVELS.HIGH;

    return {
      id: `landslide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: DISASTER_TYPES.LANDSLIDE,
      severity,
      title: 'Heyelan',
      location: city.name,
      coordinates: { lat: city.lat, lng: city.lng },
      volume: `${volume} m³`,
      timestamp: new Date(),
      description: `${city.name} bölgesinde heyelan meydana geldi. Tahmini hacim: ${volume} m³`,
      affectedPopulation: Math.floor(Math.random() * 50000 + 500),
      status: 'active'
    };
  }

  // Rastgele afet oluştur
  generateRandomDisaster() {
    const disasterGenerators = [
      () => this.generateEarthquake(),
      () => this.generateFire(),
      () => this.generateFlood(),
      () => this.generateStorm(),
      () => this.generateLandslide()
    ];

    const randomGenerator = disasterGenerators[Math.floor(Math.random() * disasterGenerators.length)];
    return randomGenerator();
  }

  // Afet dinleyicisi ekle
  addListener(callback) {
    this.listeners.push(callback);
  }

  // Afet dinleyicisi kaldır
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  // Dinleyicileri bilgilendir
  notifyListeners(disaster) {
    this.listeners.forEach(callback => {
      try {
        callback(disaster);
      } catch (error) {
        console.error('Disaster listener error:', error);
      }
    });
  }

  // Gerçek zamanlı afet simülasyonu başlat
  startSimulation() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    const generateDisaster = () => {
      if (!this.isRunning) return;
      
      const disaster = this.generateRandomDisaster();
      this.activeDisasters.push(disaster);
      this.notifyListeners(disaster);
      
      // Eski afetleri temizle (24 saatten eski)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.activeDisasters = this.activeDisasters.filter(
        d => d.timestamp > oneDayAgo
      );
      
      // Sonraki afet için rastgele süre (30 saniye - 5 dakika)
      const nextDisasterTime = Math.random() * (5 * 60 * 1000 - 30 * 1000) + 30 * 1000;
      setTimeout(generateDisaster, nextDisasterTime);
    };
    
    // İlk afeti hemen oluştur
    setTimeout(generateDisaster, 2000);
  }

  // Simülasyonu durdur
  stopSimulation() {
    this.isRunning = false;
  }

  // Aktif afetleri getir
  getActiveDisasters() {
    return this.activeDisasters;
  }

  // Afet türüne göre filtrele
  getDisastersByType(type) {
    return this.activeDisasters.filter(disaster => disaster.type === type);
  }

  // Şiddet seviyesine göre filtrele
  getDisastersBySeverity(severity) {
    return this.activeDisasters.filter(disaster => disaster.severity === severity);
  }

  // Kritik afetleri getir
  getCriticalDisasters() {
    return this.getDisastersBySeverity(SEVERITY_LEVELS.CRITICAL);
  }
}

// Singleton instance
const disasterService = new DisasterService();
export default disasterService;