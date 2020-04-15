import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import LoginScreen from "./screens/LoginScreen";
import SplashScreen from "./screens/SplashScreen";
import { axiosInstance, LOGIN_URL } from "./session/Session";

export default function App() {
  const [loading, setLoading] = React.useState(true);
  const [login, setLogin] = React.useState(false);
  

  useEffect(() => {
    const test_login = async () => {
      setLoading(false);
    };
    test_login();
  }, []);

  return (
    <PaperProvider>
      {loading ? <SplashScreen /> : (login ? <SplashScreen/>: <LoginScreen setLogin={setLogin}/> ) }
    </PaperProvider>
  );
}
