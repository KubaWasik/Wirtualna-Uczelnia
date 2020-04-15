import * as SecureStore from "expo-secure-store";
import * as React from "react";
import {Alert, AsyncStorage, Dimensions, Image, KeyboardAvoidingView, Platform} from "react-native";
import { Button, Headline, HelperText, TextInput } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import {axiosInstance, LOGIN_URL} from "../session/Session";
import cheerio from "react-native-cheerio";
import {AxiosRequestConfig} from "axios";
import qs from "qs";


const logo = require("../assets/logoUP.png");
const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
const window = Dimensions.get("window");
const IMAGE_SIZE = window.width / 2;

const LoginScreen = (props) => {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoginEmpty, setIsLoginEmpty] = React.useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Retrieve the credentials
        const loginUser = await SecureStore.getItemAsync("loginUser");
        const passwordUser = await SecureStore.getItemAsync("passwordUser");

        // if null or empty or undefined this will be eval to false
        if (loginUser && passwordUser) {
          setLogin(loginUser);
          setPassword(passwordUser);
          console.log("Credentials successfully loaded for user " + loginUser);
        } else {
          console.log("No credentials stored");
        }
      } catch (error) {
        console.log("SecureStore couldn't be accessed!", error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (login.length === 0) {
      setIsLoginEmpty(true);
    } else {
      setIsLoginEmpty(false);
    }

    if (password.length === 0) {
      setIsPasswordEmpty(true);
    } else {
      setIsPasswordEmpty(false);
    }

    if (login.length === 0 || password.length === 0) {
      return;
    }

    setLoading(true);

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
      ] = login;
    loginInputsToPost[
      "ctl00$ctl00$ContentPlaceHolder$MiddleContentPlaceHolder$txtHaslo"
      ] = password;
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

    const response1 = await axiosInstance(loginOptions);
    if(response1.request.responseURL.includes("KierunkiStudiow")){
      await SecureStore.setItemAsync("loginUser", login);
      await SecureStore.setItemAsync("passwordUser", password);
      props.setLogin(true);
    }
    
    setLoading(false);
  };

  const inputLogin = React.useRef(null);
  const inputPassword = React.useRef(null);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="position"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <Image source={logo} style={styles.logo} />
      <Headline style={styles.header}>Wirtualna Uczelnia</Headline>
      <TextInput
        label="Login"
        value={login}
        style={styles.textInput}
        mode="outlined"
        ref={inputLogin}
        onChangeText={(value) => setLogin(value)}
        onSubmitEditing={() => inputPassword.current.focus()}
        returnKeyType={"next"}
      />
      <HelperText type="error" visible={isLoginEmpty} style={styles.helperText}>
        Proszę podać login
      </HelperText>
      <TextInput
        label="Hasło"
        value={password}
        style={styles.textInput}
        mode="outlined"
        ref={inputPassword}
        onChangeText={(value) => setPassword(value)}
        secureTextEntry={true}
      />
      <HelperText
        type="error"
        visible={isPasswordEmpty}
        style={styles.helperText}
      >
        Proszę podać hasło
      </HelperText>

      <Button
        style={styles.loginButton}
        mode="outlined"
        onPress={handleSubmit}
        labelStyle={styles.loginButtonText}
      >
        Zaloguj
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    margin: 25,
  },
  header: {
    height: "40@s",
    textAlign: "center",
    fontSize: "20@s",
    paddingTop: 10,
  },
  textInput: {
    height: "50@s",
    fontSize: "12@s",
  },
  loginButton: {
    height: "50@s",
    marginTop: 15,
    alignSelf: "center",
    width: "50%",
    justifyContent: "center",
    maxHeight: 50,
  },
  loginButtonText: {
    fontSize: "10@s",
  },
  logo: {
    flexBasis: "40%",
    resizeMode: "contain",
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    alignSelf: "center",
  },
  helperText: {
    height: "30@s",
    alignSelf: "center",
    fontSize: "10@s",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20@s",
    marginBottom: "60@s",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    textAlign: "center",
    paddingTop: "10@s",
    paddingBottom: "10@s",
    fontSize: "22@s",
    lineHeight: "20@s",
  },
  modalText: {
    fontSize: "14@s",
    textAlign: "center",
  },
  button: {
    width: "50%",
    marginTop: "20@s",
    marginBottom: "20@s",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonText: {
    fontSize: "12@s",
  },
  divider: {
    margin: "20@s",
    padding: 1,
  },
});

export default LoginScreen;