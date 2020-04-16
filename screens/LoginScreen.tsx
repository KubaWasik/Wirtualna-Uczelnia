import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Alert, Dimensions, Image, KeyboardAvoidingView, Platform } from "react-native";
import { Button, Headline, HelperText, TextInput } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import { AuthContext } from "../context/Context";
import * as Errors from "../errors/Errors";
import LoadingOverview from "./LoadingOverview";

const logo = require("../assets/logoUP.png");
const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
const window = Dimensions.get("window");
const IMAGE_SIZE = window.width / 2;

const LoginScreen = () => {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoginEmpty, setIsLoginEmpty] = React.useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signIn } = React.useContext(AuthContext);

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

    const response = await signIn({ login, password });

    switch (response) {
      case Errors.ERROR:
        Alert.alert(
          "Błąd",
          "Nie udało się zalogować, wystąpił błąd, proszę spróbować ponownie",
          [{ text: "OK" }],
          { cancelable: false }
        );
        break;

      case Errors.LOGIN_PASSWORD_ERROR:
        Alert.alert(
          "Błędne dane",
          "Nie udało się zalogować, podane dane do logowania są błędne, sprawdź poprawność danych i spróbuj ponownie",
          [{ text: "OK" }],
          { cancelable: false }
        );
        break;

      case Errors.UNEXPECTED_ERROR:
        Alert.alert(
          "Nieznany błąd",
          "Nie udało się zalogować, wystąpił nieznany błąd, proszę spróbować ponownie",
          [{ text: "OK" }],
          { cancelable: false }
        );
        break;
      case Errors.NETWORK_ERROR:
        Alert.alert(
          "Błąd sieci",
          "Nie udało się zalogować, wystąpił błąd połączenia z internetem, proszę sprawdzić połączenie i spróbować ponownie",
          [{ text: "OK" }],
          { cancelable: false }
        );
        break;
      default:
        break;
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
      <LoadingOverview visible={loading} />
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
