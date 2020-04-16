import { AuthContext, ISignIn } from "./Context/Context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import { axiosInstance, LOGIN_URL } from "./session/Session";

type State = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  LogIn: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
  
export default function App() {
  const [state, dispatch]: [
    State,
    (action: { type?: string; token?: string }) => void
  ] = React.useReducer(
    (prevState: any, action: { type?: string; token?: string }) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken: string;

      try {
        // TODO: restore token from memory
      } catch (e) {
        // Restoring token failed
        console.log(e);
      }

      // After restoring token, we may need to validate it in production apps
      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      // dispatch({ type: "RESTORE_TOKEN", token: userToken });
      dispatch({ type: "RESTORE_TOKEN", token: state.userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data: ISignIn, offline: boolean = false) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

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

        const response = await axiosInstance.post(LOGIN_URL, {
          data: loginData,
        });

        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
      signOut: async () => {
        dispatch({ type: "SIGN_OUT" });
      },
      signUp: async (data: any) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
    }),
    []
  );

  return (
    <PaperProvider>
      <AuthContext.Provider value={{ ...authContext }}>
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
      </AuthContext.Provider>
    </PaperProvider>
  );
}
