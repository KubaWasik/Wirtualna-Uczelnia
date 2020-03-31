import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import { axiosInstance, LOGIN_URL } from "./session/Session";

export default function App() {
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const test_login = async () => {
      setLoading(true);
      const login = "";
      const password = "";
      const loginData =
        "ctl00_ctl00_ScriptManager1_HiddenField=&" +
        "__EVENTTARGET=&" +
        "__EVENTARGUMENT=&" +
        "__VIEWSTATE=&" +
        "__VIEWSTATEGENERATOR=&" +
        "ctl00_ctl00_TopMenuPlaceHolder_TopMenuContentPlaceHolder_MenuTop3_menuTop3_ClientState=&" +
        "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtIdent=" +
        login +
        "&" +
        "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtHaslo=" +
        password +
        "&" +
        "ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24butLoguj=Zaloguj";

      const response = await axiosInstance.post(LOGIN_URL, { data: loginData });
      //Redirect KierunkiStudiow
      setLoading(false);
    };
    test_login();
  }, []);

  return (
    <PaperProvider>
      {loading ? <SplashScreen /> : <LoginScreen />}
    </PaperProvider>
  );
}
