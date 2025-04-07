import axios from 'axios';

const API_KEY = '252d0327ca6a4c4cae472623250704'; // Your API key
const BASE_URL = 'https://api.weatherapi.com/v1';

export const fetchWeather = async (city: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}; 