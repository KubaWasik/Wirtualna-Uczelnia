import { useNetInfo } from "@react-native-community/netinfo";
import * as IntentLauncher from "expo-intent-launcher";
import React from "react";
import { AsyncStorage, Linking, Platform, ScrollView, View } from "react-native";
import { Appbar, Banner, List } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import fetchGrades, { IGrade } from "../session/FetchGrades";
import LoadingOverview from "./LoadingOverview";

function GradesScreen() {
  const [loading, setLoading] = React.useState(false);
  const [gradesTable, setGradesTable] = React.useState<IGrade[]>([]);
  const [offlineMode, setOfflineMode] = React.useState(false);
  const [bannerVisible, setBannerVisible] = React.useState(false);

  const netInfo = useNetInfo();

  React.useEffect(() => {
    if (!offlineMode) {
      if (!netInfo.isConnected || !netInfo.isInternetReachable) {
        setBannerVisible(true);
      } else {
        setBannerVisible(false);
      }
    }
  }, [netInfo]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const useOffline = await AsyncStorage.getItem("offlineMode");
      const gradesFromMemory = await AsyncStorage.getItem("gradesJSON");
      var grades: IGrade[];

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        setOfflineMode(true);
        setBannerVisible(true);
        if (gradesFromMemory) {
          grades = JSON.parse(gradesFromMemory);
        }
      } else {
        grades = await fetchGrades();
      }

      setGradesTable(grades);

      if (
        (grades && JSON.stringify(grades) !== gradesFromMemory) ||
        (grades && !gradesFromMemory)
      ) {
        const json = JSON.stringify(grades);
        await AsyncStorage.setItem("gradesJSON", json);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <View>
      <LoadingOverview visible={loading} />

      <Appbar.Header theme={{ colors: { primary: "#00c853" } }}>
        <Appbar.Content title="Wirtualna Uczelnia" />
      </Appbar.Header>
      {offlineMode ? (
        <Banner
          visible={bannerVisible}
          actions={[
            {
              label: "Rozumiem, zamknij",
              onPress: () => setBannerVisible(false),
            },
          ]}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="signal-off"
              color={color}
              size={size}
            />
          )}
        >
          Jesteś w trybie offline
        </Banner>
      ) : Platform.OS === "ios" ? (
        <Banner
          visible={bannerVisible}
          actions={[
            {
              label: "Włącz Wi-Fi",
              onPress: () => Linking.openURL("App-prefs:root=WIFI"),
            },
            {
              label: "Zamknij",
              onPress: () => setBannerVisible(false),
            },
          ]}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="signal-off"
              color={color}
              size={size}
            />
          )}
        >
          Jesteś w trybie offline
        </Banner>
      ) : (
        <Banner
          visible={bannerVisible}
          actions={[
            {
              label: "Włącz Wi-Fi",
              onPress: () =>
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ACTION_WIFI_SETTINGS
                ),
            },
            {
              label: "Włącz dane",
              onPress: () =>
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ACTION_NETWORK_OPERATOR_SETTINGS
                ),
            },
            {
              label: "Zamknij",
              onPress: () => setBannerVisible(false),
            },
          ]}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="signal-off"
              color={color}
              size={size}
            />
          )}
        >
          Jesteś w trybie offline
        </Banner>
      )}
      <ScrollView>
        {gradesTable.map((element) => (
          <List.Item
            key={element.index}
            title={element.courseName}
            description={`${element.type}, ${element.graduator}, ${element.numberOfHours}, ${element.firstTerm}, ${element.corrective}, ${element.comission}, ${element.ects}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export default GradesScreen;
