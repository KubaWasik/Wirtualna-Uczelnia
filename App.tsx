import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import { axiosInstance, LOGIN_URL } from "./session/Session";

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  LogIn: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

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
      <NavigationContainer>
        {loading ? (
          <Stack.Navigator>
            <Stack.Screen
              name="Splash"
              options={{ title: "Ładowanie", headerShown: false }}
              component={SplashScreen}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator>
            <Stack.Screen
              name="LogIn"
              component={LoginScreen}
              options={{
                title: "Zaloguj się",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: "Wirtualna uczelnia", headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
