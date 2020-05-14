import * as Sentry from "@sentry/browser";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { Alert, AsyncStorage, Text, View } from "react-native";
import { ActivityIndicator, Provider } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import fetchAllData from "../session/FetchAllData";

function SplashScreen() {
  useEffect(() => {
    const fetchData = async () => {
      const autologin = await AsyncStorage.getItem("autoLogin");
      const token = await SecureStore.getItemAsync("userToken");
      const rememberStudiesField = await AsyncStorage.getItem(
        "rememberStudiesField"
      );

      if (token && autologin === "true" && rememberStudiesField === "true") {
        try {
          await fetchAllData();
        } catch (error) {
          Sentry.captureException(error);

          Alert.alert(
            "Błąd",
            "Podczas pobierania danych nastąpił nieoczekiwany błąd. " +
              error.message
          );
        }
      }
    };

    fetchData();
  }, []);

  return (
    <Provider>
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Pobieranie danych...</Text>
      </View>
    </Provider>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    alignSelf: "center",
    paddingVertical: "20@s",
    fontSize: "20@s",
  },
});

export default SplashScreen;
