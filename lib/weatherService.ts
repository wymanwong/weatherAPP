import axios from 'axios';

const API_KEY = '252d0327ca6a4c4cae472623250704'; // Your API key
const BASE_URL = 'https://api.weatherapi.com/v1';

interface WeatherResponse {
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    uv: number;
    vis_km: number;
    pressure_mb: number;
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      "us-epa-index": number;
    };
  };
  location: {
    name: string;
    country: string;
    localtime: string;
  };
}

interface ForecastResponse extends WeatherResponse {
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        chance_of_rain: number;
        condition: {
          text: string;
          icon: string;
        };
      }>;
    }>;
  };
}

interface LocationResponse {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}

export const fetchCurrentWeather = async (city: string): Promise<WeatherResponse> => {
  try {
    console.log('Making API call to fetch current weather for:', city)
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
        aqi: 'yes'
      },
    });
    
    if (!response.data || !response.data.current) {
      console.error('Invalid response format for current weather:', response.data);
      throw new Error('Invalid weather data received');
    }

    // Ensure all required fields exist with default values if needed
    const current = response.data.current;
    const processedData = {
      ...response.data,
      current: {
        ...current,
        temp_c: current.temp_c || 0,
        condition: current.condition || { text: 'Unknown', icon: '' },
        feelslike_c: current.feelslike_c || 0,
        humidity: current.humidity || 0,
        wind_kph: current.wind_kph || 0,
        precip_mm: current.precip_mm || 0,
        uv: current.uv || 0,
        vis_km: current.vis_km || 0,
        pressure_mb: current.pressure_mb || 0,
        air_quality: current.air_quality || {
          "us-epa-index": 0,
          pm2_5: 0,
          pm10: 0,
          o3: 0,
          no2: 0
        }
      }
    };
    
    return processedData;
  } catch (error: any) {
    console.error('Error in fetchCurrentWeather:', error.message);
    if (error.response) {
      console.error('API error response:', error.response.data);
    }
    throw error;
  }
};

export const fetchForecast = async (city: string, days: number = 7): Promise<ForecastResponse> => {
  try {
    console.log('Making API call to fetch forecast for:', city, 'days:', days)
    const response = await axios.get(`${BASE_URL}/forecast.json`, {
      params: {
        key: API_KEY,
        q: city,
        days: days,
        aqi: 'no'
      },
    });
    
    if (!response.data || !response.data.forecast || !response.data.forecast.forecastday) {
      console.error('Invalid response format for forecast:', response.data);
      throw new Error('Invalid forecast data received');
    }
    
    console.log('Forecast API call successful, received days:', response.data.forecast.forecastday.length);
    return response.data;
  } catch (error: any) {
    console.error('Error in fetchForecast:', error.message);
    if (error.response) {
      console.error('API error response:', error.response.data);
    }
    throw error;
  }
};

export const searchLocations = async (query: string) => {
  try {
    console.log('Searching locations for:', query);
    const response = await axios.get<LocationResponse[]>(`${BASE_URL}/search.json`, {
      params: {
        key: API_KEY,
        q: query,
        lang: 'en' // Force English results
      },
    });
    
    // Log full location details for debugging
    console.log('Raw location data:', JSON.stringify(response.data, null, 2));
    
    // For coordinates, try to get the most specific location
    if (query.includes(',')) {
      const [lat, lon] = query.split(',').map(Number);
      // Sort locations by proximity to the given coordinates
      response.data.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lon - lon, 2));
        const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lon - lon, 2));
        return distA - distB;
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}; 