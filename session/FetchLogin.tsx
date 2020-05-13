import { AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import qs from "qs";
import { AsyncStorage } from "react-native";
import cheerio from "react-native-cheerio";
import { ISignIn } from "../context/Context";
import * as Errors from "../errors/Errors";
import { setStudiesField } from "./FetchStudiesField";
import { LOGIN_URL, Session } from "./Session";

async function fetchLogin(
  data: ISignIn,
  rememberStudiesField: boolean,
  studiesFieldNumber: string
): Promise<string> {
  const axiosInstance = await Session.getInstance();

  const loginGetResponse = await axiosInstance.get(LOGIN_URL);
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
  ] = data.login;
  loginInputsToPost[
    "ctl00$ctl00$ContentPlaceHolder$MiddleContentPlaceHolder$txtHaslo"
  ] = data.password;
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

  const response = await axiosInstance(loginOptions);

  const $ = cheerio.load(response.data);

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
    console.log("Login success, logged in");
    await SecureStore.setItemAsync("loginUser", data.login);
    await SecureStore.setItemAsync("passwordUser", data.password);

    const autoLogin = await AsyncStorage.getItem("autoLogin");
    if (!autoLogin) {
      await AsyncStorage.setItem("autoLogin", "true");
    }

    console.log("Studies field set to remember: " + rememberStudiesField);

    if (rememberStudiesField) {
      console.log(
        "Studies field number read from memory: " + studiesFieldNumber
      );

      await setStudiesField(studiesFieldNumber, true);
    }

    return "SUCCESS";
  } else {
    // Probably this will never happend in production
    console.log("Login failed, not logged in");
    return Errors.UNEXPECTED_ERROR;
  }
}

export default fetchLogin;
