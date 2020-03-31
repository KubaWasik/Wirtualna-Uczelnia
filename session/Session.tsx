import axios from 'axios';

const BASE_URL = 'https://wu.up.krakow.pl/WU/';

export const LOGIN_URL = 'Logowanie2.aspx';
export const STUDIES_FIELDS_URL = 'KierunkiStudiow.aspx';
export const PROFILE_URL = 'Wynik2.aspx';
export const GRADES_URL = 'OcenyP.aspx';
export const SCHEDULE_URL = 'PodzGodzin.aspx';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
