import { AxiosResponse } from "axios";
import * as SecureStore from "expo-secure-store";
import { AsyncStorage } from "react-native";
import cheerio from "react-native-cheerio";
import { ISignIn } from "../context/Context";
import * as Errors from "../errors/Errors";
import { setStudiesField } from "./FetchStudiesField";
import { LOGIN_URL, getAxiosInstance } from "./Session";

async function fetchLogin(
  data: ISignIn,
  rememberStudiesField: string,
  studiesFieldNumber: number
): Promise<string> {
  const axiosInstance = await getAxiosInstance();

  const loginData =
    "ctl00_ctl00_ScriptManager1_HiddenField=&" +
    "__EVENTTARGET=&" +
    "__EVENTARGUMENT=&" +
    "__VIEWSTATE=&" +
    "__VIEWSTATEGENERATOR=&" +
    "ctl00_ctl00_TopMenuPlaceHolder_TopMenuContentPlaceHolder_MenuTop3_menuTop3_ClientState=&" +
    "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtIdent=" +
    data.login +
    "&" +
    "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtHaslo=" +
    data.password +
    "&" +
    "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24butLoguj=Zaloguj";

  var response: AxiosResponse = undefined;

  try {
    response = await axiosInstance.post(
      LOGIN_URL,
      { data: loginData },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  } catch (error) {
    console.log(error);

    if (error.code === "ECONNABORTED") {
      return Errors.NETWORK_ERROR;
    }

    return Errors.ERROR;
  }

  var $ = undefined;

  try {
    $ = cheerio.load(response.data);
  } catch (error) {
    console.log(error);
    return Errors.UNEXPECTED_ERROR;
  }

  const error = $(
    "#ctl00_ctl00_ContentPlaceHolder_MiddleContentPlaceHolder_lblMessage"
  );
  const errorText = error.text();

  if (errorText.length > 0) {
    if (
      errorText.includes(
        "Zła nazwa użytkownika lub hasło! Wpisz ponownie prawidłowy identyfikator i hasło."
      )
    ) {
      return Errors.LOGIN_PASSWORD_ERROR;
    } else {
      return Errors.ERROR;
    }
  }

  if (response.request.responseURL.includes("KierunkiStudiow")) {
    console.log("Login succed, logged in");
    try {
      await SecureStore.setItemAsync("loginUser", data.login);
      await SecureStore.setItemAsync("passwordUser", data.password);

      const autoLogin = await AsyncStorage.getItem("autoLogin");
      if (!autoLogin) {
        await AsyncStorage.setItem("autoLogin", "true");
      }
    } catch (error) {
      console.log(error);
    }

    console.log("Studies field set to remember: " + rememberStudiesField);

    if (rememberStudiesField === "true") {
      console.log(
        "Studies field number read from memory: " + studiesFieldNumber
      );

      const code = await setStudiesField(studiesFieldNumber, true);

      if (code === "FAIL") {
        return Errors.NETWORK_ERROR;
      } else if (code === "SUCCESS") {
        return code;
      } else {
        return Errors.ERROR;
      }
    }

    return "SUCCESS";
  } else {
    // Probably this will never happend in production
    console.log("Login failed, not logged in");
    return Errors.UNEXPECTED_ERROR;
  }
}

export default fetchLogin;
