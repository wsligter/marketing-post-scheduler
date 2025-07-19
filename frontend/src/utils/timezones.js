/**
 * List of common timezones for user selection
 * Format: { value: 'Timezone/Location', label: 'Display Name (UTC+/-Offset)' }
 */
export const timezones = [
  // UTC
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  
  // Europe
  { value: 'Europe/London', label: 'London, Dublin, Lisbon (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris, Berlin, Rome, Madrid, Amsterdam (CET/CEST)' },
  { value: 'Europe/Brussels', label: 'Brussels, Copenhagen, Vienna (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm, Oslo, Gothenburg (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich, Geneva, Bern (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Prague, Budapest, Warsaw (CET/CEST)' },
  { value: 'Europe/Athens', label: 'Athens, Bucharest, Istanbul (EET/EEST)' },
  { value: 'Europe/Helsinki', label: 'Helsinki, Tallinn, Riga, Kyiv (EET/EEST)' },
  { value: 'Europe/Moscow', label: 'Moscow, St. Petersburg, Minsk (MSK)' },
  
  // Middle East & Africa
  { value: 'Asia/Dubai', label: 'Dubai, Abu Dhabi, Muscat (GST)' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem, Tel Aviv (IST)' },
  { value: 'Africa/Cairo', label: 'Cairo, Alexandria (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg, Cape Town (SAST)' },
  { value: 'Africa/Lagos', label: 'Lagos, Kano, Abuja (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi, Mombasa, Dar es Salaam (EAT)' },
  
  // Asia
  { value: 'Asia/Kolkata', label: 'Mumbai, New Delhi, Bangalore, Chennai (IST)' },
  { value: 'Asia/Karachi', label: 'Karachi, Lahore, Islamabad (PKT)' },
  { value: 'Asia/Dhaka', label: 'Dhaka, Chittagong (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok, Hanoi, Jakarta (ICT/WIB)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong, Macau (HKT)' },
  { value: 'Asia/Shanghai', label: 'Shanghai, Beijing, Guangzhou (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore, Kuala Lumpur (SGT/MYT)' },
  { value: 'Asia/Seoul', label: 'Seoul, Busan (KST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka, Kyoto (JST)' },
  { value: 'Asia/Manila', label: 'Manila, Quezon City (PST)' },
  { value: 'Asia/Taipei', label: 'Taipei, Kaohsiung (CST)' },
  
  // Australia & Pacific
  { value: 'Australia/Perth', label: 'Perth, Fremantle (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Brisbane', label: 'Brisbane, Gold Coast (AEST)' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne, Canberra (AEST/AEDT)' },
  { value: 'Pacific/Auckland', label: 'Auckland, Wellington (NZST/NZDT)' },
  { value: 'Pacific/Fiji', label: 'Suva, Nadi (FJT)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu, Waikiki (HST)' },
  
  // North America
  { value: 'America/Anchorage', label: 'Anchorage, Juneau (AKST/AKDT)' },
  { value: 'America/Vancouver', label: 'Vancouver, Victoria (PT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles, San Francisco, Seattle (PT)' },
  { value: 'America/Phoenix', label: 'Phoenix, Tucson (MST)' },
  { value: 'America/Denver', label: 'Denver, Salt Lake City, Albuquerque (MT)' },
  { value: 'America/Chicago', label: 'Chicago, Houston, Dallas, Mexico City (CT)' },
  { value: 'America/Toronto', label: 'Toronto, Ottawa, Montreal (ET)' },
  { value: 'America/New_York', label: 'New York, Washington DC, Boston, Atlanta (ET)' },
  { value: 'America/Halifax', label: 'Halifax, Saint John (AT)' },
  { value: 'America/St_Johns', label: 'St. John\'s (NT)' },
  
  // Central & South America
  { value: 'America/Puerto_Rico', label: 'San Juan, Santo Domingo, Havana (AST/EST)' },
  { value: 'America/Bogota', label: 'Bogotá, Lima, Quito (COT/PET/ECT)' },
  { value: 'America/Caracas', label: 'Caracas, Maracaibo (VET)' },
  { value: 'America/Santiago', label: 'Santiago, Valparaíso (CLT/CLST)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Montevideo (ART/UYT)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Rio de Janeiro, Brasília (BRT/BRST)' },
];

/**
 * Get the user's local timezone
 * @returns {string} IANA timezone identifier (e.g., 'America/New_York')
 */
export const getUserLocalTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam';
  } catch (error) {
    console.error('Error getting local timezone:', error);
    return 'Europe/Amsterdam';
  }
};

/**
 * Format a date according to the specified timezone
 * @param {Date|string} date - Date object or date string
 * @param {string} timezone - IANA timezone identifier
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateInTimezone = (date, timezone = 'Europe/Amsterdam', options = {}) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const defaultOptions = { 
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', {
      ...defaultOptions,
      timeZone: timezone
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return new Date(date).toLocaleString();
  }
};
