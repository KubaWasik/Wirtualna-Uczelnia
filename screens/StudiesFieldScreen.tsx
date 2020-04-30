import * as React from "react";
import { Alert, AsyncStorage, StyleSheet, Text, View } from "react-native";
import { Appbar, Button, Checkbox, RadioButton, TouchableRipple } from "react-native-paper";
import { fetchStudiesField, IField, setStudiesField } from "../session/FetchStudiesField";
import LoadingOverview from "./LoadingOverview";

function StudiesFieldScreen({ navigation }) {
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [checked, setChecked] = React.useState(false);
  const [fields, setFields] = React.useState<IField[]>([]);

  const chooseStudiesField = async (field: number) => {
    if (field == 0) {
      Alert.alert(
        "Uwaga",
        "Proszę wybrać jeden z kierunków",
        [{ text: "OK" }],
        { cancelable: false }
      );

      return;
    }

    setLoading(true);
    const response = await setStudiesField(field, checked);
    setLoading(false);

    if (response === "SUCCESS") {
      navigation.navigate("Home");
    } else {
      Alert.alert("Błąd", "Podczas wyboru kierunku wystąpił błąd. " + response);
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
          onPress={() => chooseStudiesField(value)}
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
