import React from "react";
import { Text, View } from "react-native";
import { ActivityIndicator, Colors } from "react-native-paper";

function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={Colors.blue800} />
      <Text>Ładowanie...</Text>
    </View>
  );
}

export default SplashScreen;
