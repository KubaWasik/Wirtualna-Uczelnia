export const UNEXPECTED_ERROR: string = "unexpectedError";
export const ERROR: string = "Error";
/// wrong login or password
export const LOGIN_PASSWORD_ERROR: string = "loginPasswordError";
export const NETWORK_ERROR: string = "networkError";
/// error when creating axios instance
export const AXIOS_CREATE: string = "axiosCreate";
/// network aborted not described by axios lib
export const AXIOS_UNKNOWN: string = "axiosUnknown";
/// AXIOS_NETWORK means timeout or connection aborted
export const AXIOS_NETWORK: string = "axiosNetwork";
/// error with storage (SecureStore/AsyncStorage), unable to write/read data
export const STORAGE: string = "storage";
/// error with cheerio, really this probably never would be used because when cheerio object crashes it fall in infinite loop
export const CHEERIO: string = "cheerio";

export class AxiosNetwork extends Error {}