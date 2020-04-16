import * as SecureStore from "expo-secure-store";
import React from "react";
import { AsyncStorage, View } from "react-native";
import { Button, Colors, Divider, Headline, Text } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";
import { AuthContext } from "../context/Context";

function OfflineScreen() {
  const [isInMemory, setIsInMemory] = React.useState(false);
  const { signIn } = React.useContext(AuthContext);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const loginUser = await SecureStore.getItemAsync("loginUser");
        const passwordUser = await SecureStore.getItemAsync("passwordUser");

        const keys = await AsyncStorage.getAllKeys();
        if (
          loginUser &&
          passwordUser &&
          keys.includes("userDataJSON") &&
          keys.includes("scheduleTableJSON") &&
          keys.includes("userDataJSON")
        ) {
          console.log("There are data in memory, could set offline mode");
          setIsInMemory(true);
        } else {
          setIsInMemory(false);
          console.log(
            "There are not enough saved data in memory, could not set offline mode"
          );
        }
      } catch (error) {
        console.log("SecureStore couldn't be accessed!", error);
        setIsInMemory(false);
      }
    };

    fetchData();
  }, []);

  const handleOffline = async () => {
    console.log("click");
    await signIn(null, true);
  };

  return (
    <View style={styles.container}>
      <View>
        <Headline style={styles.header}>Jesteś offline</Headline>
        <Text style={styles.text}>
          Jeśli zalogowałeś się chociaż raz, Twoje dane zostały zapisane w
          pamięci aplikacji i możesz je teraz wyświetlić w trybie offline,
          zostaną wyświetlone dane z ostatnio wybranego kierunku studiów, jednak
          miej na uwadze, że te dane mogły zostać zmodyfikowane na serwerze
        </Text>
        <Divider style={styles.divider} />
        <Text style={styles.text}>
          Upewnij się, że masz połączenie z internetem, aplikacja automatycznie
          przejdzie do trybu online. Gdy przejdziesz do trybu online będziesz
          mógł się zalogować i pobrać aktualne dane
        </Text>
        <Divider style={styles.divider} />
        {isInMemory ? (
          <View>
            <Text style={styles.text}>
              Przejdź do aplikacji w trybie offline i wyświetl dane zapisane w
              pamięci. Aby później przejść do trybu online, przejdź do ustawień
              i kliknij odpowiedni przycisk
            </Text>
            <Button
              style={styles.button}
              labelStyle={styles.buttonText}
              mode="outlined"
              onPress={handleOffline}
            >
              Tryb offline
            </Button>
          </View>
        ) : (
          <Text style={styles.warningText}>
            Nie zapisano żadnych danych, nie można uruchomić w trybie offline
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    padding: "25@s",
  },
  header: {
    textAlign: "center",
    paddingTop: "10@s",
    paddingBottom: "10@s",
    fontSize: "22@s",
    lineHeight: "20@s",
  },
  text: {
    fontSize: "14@s",
    textAlign: "center",
  },
  warningText: {
    fontSize: "14@s",
    textAlign: "center",
    color: Colors.deepOrange400,
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

export default OfflineScreen;
