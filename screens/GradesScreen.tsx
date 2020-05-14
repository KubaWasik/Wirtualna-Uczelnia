import { useNetInfo } from "@react-native-community/netinfo";
import * as IntentLauncher from "expo-intent-launcher";
import React from "react";
import { AsyncStorage, Linking, Platform, ScrollView, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Appbar, Banner, List, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { IGrades } from "../session/FetchGrades";
import LoadingOverview from "./LoadingOverview";

function GradesScreen() {
  const [loading, setLoading] = React.useState(false);
  const [gradesTable, setGradesTable] = React.useState<IGrades>({});
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
      var grades: IGrades = undefined;

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        setOfflineMode(true);
        setBannerVisible(true);
      }

      if (gradesFromMemory) {
        grades = JSON.parse(gradesFromMemory);
      }

      setGradesTable(grades);

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
      <ScrollView style={{ marginBottom: 70, paddingBottom: 20 }}>
        <List.AccordionGroup>
          {Object.keys(gradesTable).map((subject) => (
            <List.Accordion
              key={subject}
              title={subject}
              id={subject}
              left={(props) => (
                <List.Icon {...props} icon="help-circle-outline" />
              )}
            >
              {Object.keys(gradesTable[subject]).map((gradeItem) => (
                <TouchableOpacity
                  style={{
                    borderRadius: 50,
                    backgroundColor: "#e0ecff",
                    padding: 10,
                    margin: 5,
                  }}
                  key={gradeItem}
                  onPress={() => null}
                >
                  <Text>
                    {gradeItem} -{" "}
                    {gradesTable[subject][gradeItem].firstTerm.trim().length
                      ? gradesTable[subject][gradeItem].firstTerm
                      : "Brak oceny"}
                  </Text>
                </TouchableOpacity>
              ))}
            </List.Accordion>
          ))}
        </List.AccordionGroup>
      </ScrollView>
    </View>
  );
}

export default GradesScreen;
