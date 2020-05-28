import { StackNavigationProp } from "@react-navigation/stack";
import { Updates } from "expo";
import React from "react";
import { AsyncStorage, StyleSheet, View } from "react-native";
import { Appbar, Button, Switch, Title } from "react-native-paper";
import { RootStackParamList } from "../App";
import { AuthContext } from "../context/Context";
import LoadingOverview from "./LoadingOverview";

type SettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Home"
>;

type Props = {
  navigation: SettingsScreenNavigationProp;
};

export default function SettingsScreen(props: Props) {
  const [loading, setLoading] = React.useState(false);
  const [autoLogin, setAutoLogin] = React.useState(false);
  const [rememberStudiesField, setRememberStudiesField] = React.useState(false);

  const { signOut } = React.useContext(AuthContext);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const autoLoginFromMemory = await AsyncStorage.getItem("autoLogin");
      const remeberField = await AsyncStorage.getItem("rememberStudiesField");

      autoLoginFromMemory === "true" ? setAutoLogin(true) : setAutoLogin(false);

      remeberField === "true"
        ? setRememberStudiesField(true)
        : setRememberStudiesField(false);

      setLoading(false);
    };

    fetchData();
  }, []);

  const changeRememberStudiesField = async () => {
    setLoading(true);

    setRememberStudiesField(!rememberStudiesField);

    await AsyncStorage.setItem(
      "rememberStudiesField",
      !rememberStudiesField ? "true" : "false"
    );

    setLoading(false);
  };

  const changeAutoLogin = async () => {
    setLoading(true);

    setAutoLogin(!autoLogin);

    await AsyncStorage.setItem("autoLogin", !autoLogin ? "true" : "false");

    setLoading(false);
  };

  return (
    <View style={styles.flex}>
      <LoadingOverview visible={loading} />

      <Appbar.Header theme={{ colors: { primary: "#ffab00" } }}>
        <Appbar.Content title="Wirtualna Uczelnia" />
      </Appbar.Header>
      <View style={styles.container}>
        <View style={styles.flexRow}>
          <Title style={styles.rowTitle}>Loguj automatycznie</Title>
          <Switch
            value={autoLogin}
            onValueChange={() => {
              changeAutoLogin();
            }}
          />
        </View>
        <View style={styles.flexRow}>
          <Title style={styles.rowTitle}>Zapamiętaj kierunek studiów</Title>
          <Switch
            value={rememberStudiesField}
            onValueChange={() => {
              changeRememberStudiesField();
            }}
          />
        </View>
        <View style={styles.flexRow}>
          <Button
            style={styles.button70}
            mode="outlined"
            onPress={() => {
              props.navigation.navigate("StudiesField");
            }}
          >
            Zmień kierunek studiów
          </Button>
        </View>
        <View style={styles.flexRow}>
          <Button
            style={styles.button50}
            mode="outlined"
            onPress={async () => {
              await signOut();
              Updates.reload();
            }}
          >
            Wyloguj
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTitle: {
    width: "70%",
    paddingRight: 25,
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    marginTop: 25,
  },
  button50: {
    marginTop: 15,
    alignSelf: "center",
    width: "50%",
  },
  button70: {
    marginTop: 15,
    alignSelf: "center",
    width: "70%",
  },
});
