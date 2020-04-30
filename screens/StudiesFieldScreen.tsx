import { StackNavigationProp } from "@react-navigation/stack";
import { Updates } from "expo";
import * as React from "react";
import { Alert, AsyncStorage, StyleSheet, Text, View } from "react-native";
import { Appbar, Button, Checkbox, RadioButton, TouchableRipple } from "react-native-paper";
import { RootStackParamList } from "../App";
import * as Errors from "../errors/Errors";
import fetchAllData from "../session/FetchAllData";
import { fetchStudiesField, IField, setStudiesField } from "../session/FetchStudiesField";
import LoadingOverview from "./LoadingOverview";

type StudiesFieldScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "StudiesField"
>;

type Props = {
  navigation: StudiesFieldScreenNavigationProp;
};

function StudiesFieldScreen(props: Props) {
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [checked, setChecked] = React.useState(false);
  const [fields, setFields] = React.useState<IField[]>([]);

  const chooseStudiesField = async (field: string) => {
    if (field === "0") {
      Alert.alert(
        "Uwaga",
        "Proszę wybrać jeden z kierunków",
        [{ text: "OK" }],
        { cancelable: false }
      );

      return;
    }

    setLoading(true);

    try {
      await setStudiesField(field, checked);
      await fetchAllData();

      setLoading(false);
      props.navigation.navigate("Home");
    } catch (error) {
      if (error instanceof Errors.AxiosNetwork) {
        // Timeout - suggest offline mode
        console.log("Timeout - suggest offline mode");
        Alert.alert(
          "Błąd",
          "Nastąpił błąd połączenia, Twoja sieć może mieć za słaby zasięg, spróbuj ponownie. Jeśli widzisz to kolejny raz możesz spróbować wejśc do trybu offline zamiast tego",
          [
            { text: "Zamknij", onPress: () => null },
            { text: "Spróbuj ponownie", onPress: () => Updates.reload() },
            {
              text: "Tryb offline",
              onPress: () => null /* TODO: make it works*/,
            },
          ],
          { cancelable: false }
        );
      } else {
        // Other errors - suggest restart
        Alert.alert(
          "Błąd",
          "Nastąpił nieoczekiwany błąd, spróbuj ponownie.",
          [
            { text: "Zamknij", onPress: () => null },
            { text: "Spróbuj ponownie", onPress: () => Updates.reload() },
          ],
          { cancelable: false }
        );
      }
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const useOffline = await AsyncStorage.getItem("offlineMode");
      const fieldsFromMemory = await AsyncStorage.getItem("studiesFieldJSON");
      var fields: IField[] = undefined;

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        if (fieldsFromMemory) {
          fields = JSON.parse(fieldsFromMemory);
        }
      } else {
        fields = await fetchStudiesField();
      }

      setFields(fields);

      if (
        (fields && JSON.stringify(fields) !== fieldsFromMemory) ||
        (fields && !fieldsFromMemory)
      ) {
        const json = JSON.stringify(fields);
        await AsyncStorage.setItem("studiesFieldJSON", json);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <View>
      <LoadingOverview visible={loading} />
      <Appbar.Header>
        <Appbar.Content title="Wirtualna Uczelnia" />
      </Appbar.Header>
      <View style={styles.container}>
        <RadioButton.Group
          onValueChange={(value) => setValue(Number.parseInt(value))}
          value={value.toString()}
        >
          {fields.map((element) => (
            <RadioButton.Item
              key={element.id}
              label={element.label}
              value={element.value.toString()}
              style={styles.radioButton}
            />
          ))}
        </RadioButton.Group>
        <TouchableRipple
          rippleColor="rgba(0, 0, 0, .32)"
          onPress={() => {
            setChecked(!checked);
          }}
        >
          <View style={styles.flexrow}>
            <Checkbox status={checked ? "checked" : "unchecked"} />
            <Text style={styles.checkboxLabel}>Zapamiętaj moj wybór</Text>
          </View>
        </TouchableRipple>
        <Button
          mode="contained"
          onPress={() => chooseStudiesField(value.toString())}
          style={styles.submitButton}
        >
          Wybierz
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 25,
    paddingTop: "20%",
  },
  flexrow: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 50,
  },
  checkboxLabel: {
    marginTop: 8,
  },
  submitButton: {
    width: "50%",
    alignSelf: "center",
  },
  radioButton: {
    marginBottom: 25,
  },
});

export default StudiesFieldScreen;