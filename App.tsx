import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import cheerio from 'react-native-cheerio';

export default function App() {

  useEffect( ()=> {
    const test_parse = async () => {
      const googleSite = await fetch("https://www.google.com");

      const $ = cheerio.load(await googleSite.text());

      const footer = $("#footer").text();

      console.log(footer);
    }

    test_parse();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
