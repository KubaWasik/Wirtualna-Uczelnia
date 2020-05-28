import { useNetInfo } from "@react-native-community/netinfo";
import * as IntentLauncher from "expo-intent-launcher";
import React from "react";
import { AsyncStorage, Clipboard, Linking, Platform, ScrollView, View } from "react-native";
import { Appbar, Banner, List, Snackbar } from "react-native-paper";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import { IDataItem } from "../session/FetchUserData";
import LoadingOverview from "./LoadingOverview";

function UserDataScreen() {
  const [loading, setLoading] = React.useState(false);
  const [profileInfo, setProfileInfo] = React.useState<IDataItem[]>([]);
  const [visible, setVisible] = React.useState(false);
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
      const itemsFromMemory = await AsyncStorage.getItem("userDataJSON");
      var items: IDataItem[] = undefined;

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        setOfflineMode(true);
        setBannerVisible(true);
      }

      if (itemsFromMemory) {
        items = JSON.parse(itemsFromMemory);
      }

      setProfileInfo(items);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <View>
      <LoadingOverview visible={loading} />

      <Appbar.Header theme={{ colors: { primary: "#dd2c00" } }}>
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
        {profileInfo.map((element) => (
          <List.Item
            key={element.key}
            title={element.title}
            description={element.description}
            onPress={() => {
              Clipboard.setString(element.description);
              setVisible(true);
            }}
          />
        ))}
      </ScrollView>
      <Snackbar
        duration={1500}
        visible={visible}
        onDismiss={() => setVisible(false)}
        action={{
          label: "Ok",
          onPress: () => null,
        }}
      >
        Skopiowano do schowka
      </Snackbar>
    </View>
  );
}

export default UserDataScreen;
