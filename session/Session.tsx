import * as Sentry from "@sentry/browser";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import qs from "qs";
import { AsyncStorage } from "react-native";
import cheerio from "react-native-cheerio";
import * as Errors from "../errors/Errors";

const BASE_URL: string = "https://wu.up.krakow.pl/WU/";

export const LOGIN_URL: string = "Logowanie2.aspx";
export const STUDIES_FIELDS_URL: string = "KierunkiStudiow.aspx";
export const PROFILE_URL: string = "Wynik2.aspx";
export const GRADES_URL: string = "OcenyP.aspx";
export const SCHEDULE_URL: string = "PodzGodzin.aspx";

/**
 * Object representing credentials used to login to WU
 */
export type Credentials = {
  login: string;
  password: string;
};

/**
 * @abstract
 * @classdesc Session, contains main property instance of type AxiosInstance
 * which will be used to fetch data from server, use *SessionObject*.getInstance() to get instance
 */
export abstract class Session {
  private static _instance: AxiosInstance;

  private static _credentials: Credentials;
  private static _rememberStudiesField: boolean;
  private static _studiesFieldNumber: string;

  private static async checkAccessTimeout() {
    if (this._credentials.login && this._credentials.password) {
      const response = await this._instance.get(PROFILE_URL);
      return response.request.responseURL.includes("accesstimeout")
        ? true
        : false;
    }

    return false;
  }

  private static async sendLogin() {
    const loginGetResponse = await this._instance.get(LOGIN_URL);
    const login$ = cheerio.load(loginGetResponse.data);
    const loginInputsToPost = {};
    const hiddenLoginInputs = login$("input[type='hidden']");
    hiddenLoginInputs.each((index, element) => {
      loginInputsToPost[element.attribs.name] = element.attribs.value
        ? element.attribs.value
        : "";
    });

    loginInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$MiddleContentPlaceHolder$txtIdent"
    ] = this._credentials.login;
    loginInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$MiddleContentPlaceHolder$txtHaslo"
    ] = this._credentials.password;
    loginInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$MiddleContentPlaceHolder$butLoguj"
    ] = "Zaloguj";

    const loginOptions: AxiosRequestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(loginInputsToPost),
      url: LOGIN_URL,
    };

    const loginResponse = await this._instance(loginOptions);

    if (!loginResponse.request.responseURL.includes("KierunkiStudiow")) {
      Sentry.setExtra("data", loginGetResponse.config);
      Sentry.captureMessage("Login error");

      throw new Errors.AxiosNetwork("Login");
    }
  }

  private static async sendStudiesField() {
    const studiesFielsResponse = await this._instance.get(STUDIES_FIELDS_URL);

    const $ = cheerio.load(studiesFielsResponse.data);

    const studiesFieldsInputsToPost = {};
    const hiddenStudiesFieldsInputs = $("input[type='hidden']");

    hiddenStudiesFieldsInputs.each((index, element) => {
      studiesFieldsInputsToPost[element.attribs.name] = element.attribs.value;
    });

    studiesFieldsInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$RightContentPlaceHolder$rbKierunki"
    ] = this._studiesFieldNumber;
    studiesFieldsInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$RightContentPlaceHolder$Button1"
    ] = "wybierz";

    const options: AxiosRequestConfig = {
      method: "POST",
      headers: {
        "Host": "wu.up.krakow.pl",
        "Connection": "keep-alive",
        "Content-Length": "2777",
        "Cache-Control": "max-age=0",
        "Origin": "https://wu.up.krakow.pl",
        "Upgrade-Insecure-Requests": "1",
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36",
        "Sec-Fetch-Dest": "document",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Referer": "https://wu.up.krakow.pl/WU/KierunkiStudiow.aspx",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "pl,en-GB;q=0.9,en;q=0.8,en-US;q=0.7",
      },
      data: qs.stringify(studiesFieldsInputsToPost),
      url: STUDIES_FIELDS_URL,
    };

    const postResponse = await this._instance(options);

    if (!postResponse.request.responseURL.includes("Ogloszenia")) {
      // If not "Ogloszenia" but Error404 chceck for login success
      if (postResponse.request.responseURL.includes("Error404")) {
        // GET grades
        const errorResponse = await this._instance.get(GRADES_URL);
        // If grades fetched then Error404 is just because WU is fucked up so much
        if (!errorResponse.request.responseURL.includes("OcenyP")) {
          // If grades not fetched "something" bad happened so send Critical message and attach request config
          Sentry.setExtra("data", postResponse.config);
          Sentry.captureMessage(
            "Studies field Error404, not logged in",
            Sentry.Severity.Critical
          );

          throw new Errors.AxiosNetwork("Studies field Error404");
        } else {
          // Send Warning message
          Sentry.setExtra("data", postResponse.config);
          Sentry.captureMessage(
            "Studies field Error404 but login success",
            Sentry.Severity.Warning
          );
        }
      } else {
        // Critical error, cannot login not 404 but something on server side
        Sentry.setExtra("data", postResponse.config);
        Sentry.captureMessage("Studies field error");

        throw new Errors.AxiosNetwork("Studies field");
      }
    }
  }

  private static async create() {
    const login = await SecureStore.getItemAsync("loginUser");
    const password = await SecureStore.getItemAsync("passwordUser");
    const rememberStudiesFieldFromMemory = await AsyncStorage.getItem(
      "rememberStudiesField"
    );
    const rememberStudiesField = rememberStudiesFieldFromMemory === "true";
    const studiesFieldNumber = await AsyncStorage.getItem("studiesFieldNumber");

    try {
      this._instance = axios.create({
        baseURL: BASE_URL,
        withCredentials: true,
        timeout: 5000,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error" + JSON.stringify(error));

      throw new Errors.AxiosNetwork("Create instance");
    }

    this._credentials = { login, password };
    this._rememberStudiesField = rememberStudiesField;
    this._studiesFieldNumber = studiesFieldNumber;
  }

  public static async getInstance() {
    if (this._instance === undefined) {
      await this.create();
    }
    const accessTimeout = await this.checkAccessTimeout();
    if (accessTimeout) {
      await this.sendLogin();
      if (this._rememberStudiesField) {
        await this.sendStudiesField();
      }

      return this._instance;
    } else {
      return this._instance;
    }
  }
}
