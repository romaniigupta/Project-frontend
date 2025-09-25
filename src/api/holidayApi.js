import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/holidays';

export const getHolidays = async (country, year) => {
  try {
    const res = await axios.get(BASE_URL, {
      params: { country, year }
    });
    return res.data;
  } catch (err) {
    console.error('Error fetching holidays:', err);
    return [];
  }
};

export const getCountries = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/countries`);
    return res.data;
  } catch (err) {
    console.error('Error fetching countries:', err);
    return [];
  }
};
