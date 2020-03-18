import * as React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image
} from "react-native";
import { ScaledSheet } from "react-native-size-matters";
import { Headline, TextInput, Button } from "react-native-paper";

const logo = require("../assets/icon.png");
const keyboardVerticalOffset = Platform.OS === "ios" ? 40 : 0;
const window = Dimensions.get("window");
const IMAGE_SIZE = window.width / 2;

function LoginScreen() {
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
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
        onChangeText={value => setLogin(value)}
        onSubmitEditing={() => inputPassword.current.focus()}
        returnKeyType={"next"}
      />
      <TextInput
        label="Hasło"
        value={password}
        style={styles.textInput}
        mode="outlined"
        ref={inputPassword}
        onChangeText={value => setPassword(value)}
        secureTextEntry={true}
      />
      <Button
        style={styles.loginButton}
        mode="outlined"
        onPress={() => console.log("button pressed")}
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
    flexBasis: "10%",
    textAlign: "center",
    fontSize: 20,
    paddingTop: 10
  },
  textInput: {
    flexBasis: "15%",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 12
  },
  loginButton: {
    flexBasis: "10%",
    marginTop: 15,
    alignSelf: "center",
    width: "50%",
    justifyContent: "center"
  },
  logo: {
    flexBasis: "40%",
    resizeMode: "contain",
    height: IMAGE_SIZE,
    width: IMAGE_SIZE,
    alignSelf: "center",
    marginBottom: 10,
    padding: 10
  },
  helperText: {
    flexBasis: "10%",
    alignSelf: "center",
    fontSize: 10
  }
});

export default LoginScreen;
