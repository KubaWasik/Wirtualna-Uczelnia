import * as React from "react";
import { View } from "react-native";
import Modal from "react-native-modal";
import { ActivityIndicator, Colors, Headline } from "react-native-paper";
import { ScaledSheet } from "react-native-size-matters";

function LoadingOverview({visible}) {
  return (
    <Modal isVisible={visible} backdropOpacity={0.3}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.blue800} />
        <Headline style={styles.title}>Ładowanie...</Headline>
      </View>
    </Modal>
  );
}

const styles = ScaledSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    color: "white",
    marginTop: "20@s",
  },
});

export default LoadingOverview;
