import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Sentry from "@sentry/browser";
import * as SecureStore from "expo-secure-store";
import moment from "moment";
import React from "react";
import { AsyncStorage } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthContext, ISignIn } from "./context/Context";
import * as Errors from "./errors/Errors";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import OfflineScreen from "./screens/OfflineScreen";
import SplashScreen from "./screens/SplashScreen";
import StudiesFieldScreen from "./screens/StudiesFieldScreen";
import fetchLogin from "./session/FetchLogin";
import { setStudiesField } from "./session/FetchStudiesField";
import { createAxiosInstance } from "./session/Session";

type RootStackParamList = {
  Splash: undefined;
  Offline: undefined;
  Home: undefined;
  LogIn: undefined;
  StudiesField: undefined;
};

type State = {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string;
  rememberStudiesField: string;
  studiesFieldNumber: number;
  offline: boolean;
  autoLogin: string;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  Sentry.init({
    //overwritten
    dsn: "",
  });
  const netInfo = useNetInfo();

  React.useEffect(() => {
    console.log("netInfo hook:");
    console.log(netInfo);
  }, [netInfo]);

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
        case "SIGN_IN_OFFLINE":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            offline: true,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      rememberStudiesField: null,
      studiesFieldNumber: null,
      offline: false,
      autoLogin: false,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken: string;

      try {
        await createAxiosInstance();
        state.autoLogin = await AsyncStorage.getItem("autoLogin");

        state.autoLogin && state.autoLogin === "true"
          ? (userToken = await SecureStore.getItemAsync("userToken"))
          : (userToken = null);

        state.rememberStudiesField = await AsyncStorage.getItem(
          "rememberStudiesField"
        );
        const studiesFieldNumberFromMemory = await AsyncStorage.getItem(
          "studiesFieldNumber"
        );
        state.studiesFieldNumber = studiesFieldNumberFromMemory
          ? Number.parseInt(studiesFieldNumberFromMemory)
          : null;

        if (state.rememberStudiesField && state.studiesFieldNumber) {
          setStudiesField(state.studiesFieldNumber, true);
        }
      } catch (e) {
        // Restoring token failed
        console.log(e);
      }

      // After restoring token, we may need to validate it in production apps

      if (userToken) {
        const now = moment();
        const dif = now.diff(moment(userToken), "days");
        dif > 30 ? (userToken = null) : null;
      }

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data: ISignIn, offline: boolean = false) => {
        console.log("signIn offline: " + offline);

        if (offline) {
          AsyncStorage.setItem("offlineMode", "true");
          const token = moment().format("YYYY-MM-DD hh:mm");
          await SecureStore.setItemAsync("userToken", token);

          dispatch({ type: "SIGN_IN_OFFLINE", token: token });
          return;
        }

        console.log("NetInfo.fetch()");
        const info = await NetInfo.fetch();
        console.log(info);

        if (!info.isConnected || !info.isInternetReachable) {
          return Errors.NETWORK_ERROR;
        }

        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        const response = await fetchLogin(
          data,
          state.rememberStudiesField,
          state.studiesFieldNumber
        );

        if (response === "SUCCESS") {
          const token = moment().format("YYYY-MM-DD hh:mm");
          await SecureStore.setItemAsync("userToken", token);
          setStudiesField(171737, true);

          dispatch({ type: "SIGN_IN", token: token });
        } else {
          return response;
        }
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync("userToken");
        const t = await SecureStore.getItemAsync("userToken");

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
          {state.isLoading ? (
            // We haven't finished checking for the token yet
            <Stack.Navigator>
              <Stack.Screen
                name="Splash"
                options={{ title: "Ładowanie", headerShown: false }}
                component={SplashScreen}
              />
            </Stack.Navigator>
          ) : !state.offline &&
            (!netInfo.isConnected || !netInfo.isInternetReachable) ? (
            <Stack.Navigator>
              <Stack.Screen
                name="Offline"
                options={{ title: "Tryb offline", headerShown: false }}
                component={OfflineScreen}
              />
            </Stack.Navigator>
          ) : state.userToken == null ? (
            // No token found, user isn't signed in
            <Stack.Navigator>
              <Stack.Screen
                name="LogIn"
                component={LoginScreen}
                options={{
                  title: "Zaloguj się",
                  // When logging out, a pop animation feels intuitive
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          ) : /* TODO: If user have not choose field of study yet then show StudiesFieldScreen */
          state.rememberStudiesField === "false" ||
            state.rememberStudiesField == null ? (
            // User is signed in
            <Stack.Navigator>
              <Stack.Screen
                name="StudiesField"
                component={StudiesFieldScreen}
                options={{ title: "Wybór kierunku", headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Wirtualna uczelnia", headerShown: false }}
              />
            </Stack.Navigator>
          ) : (
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Wirtualna uczelnia", headerShown: false }}
              />
              <Stack.Screen
                name="StudiesField"
                component={StudiesFieldScreen}
                options={{ title: "Wybór kierunku", headerShown: false }}
              />
            </Stack.Navigator>
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}
