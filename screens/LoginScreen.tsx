import * as React from "react";
import { Dimensions, Image, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Button, Headline, HelperText, TextInput } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import { axiosInstance } from "../session/Session";

const logo = require("../assets/logoUP.png");
const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
const window = Dimensions.get("window");
const IMAGE_SIZE = window.width / 2;

function LoginScreen() {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoginEmpty, setIsLoginEmpty] = React.useState(false);
  const [isPasswordEmpty, setIsPasswordEmpty] = React.useState(false);

  const inputLogin = React.useRef(null);
  const inputPassword = React.useRef(null);

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

    // TODO: login function

    // const response = await axiosInstance.post( some URL, some data, some config );

    // alert error if fail, well now it will always fail
    
    Alert.alert(
      "Błąd",
      "Nie udało się zalogować, wystąpił błąd, proszę spróbować ponownie",
      [{ text: "OK" }],
      { cancelable: false }
    );
  };

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
        onChangeText={value => setLogin(value)}
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
        onChangeText={value => setPassword(value)}
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
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    margin: 25
  },
  header: {
    height: "40@s",
    textAlign: "center",
    fontSize: "20@s",
    paddingTop: 10
  },
  textInput: {
    height: "50@s",
    fontSize: "12@s"
  },
  loginButton: {
    height: "50@s",
    marginTop: 15,
    alignSelf: "center",
    width: "50%",
    justifyContent: "center",
    maxHeight: 50
  },
  loginButtonText: {
    fontSize: "10@s"
  },
  logo: {
    flexBasis: "40%",
    resizeMode: "contain",
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    alignSelf: "center"
  },
  helperText: {
    height: "30@s",
    alignSelf: "center",
    fontSize: "10@s"
  }
});

export default LoginScreen;
