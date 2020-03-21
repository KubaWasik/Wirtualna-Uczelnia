import React, {useEffect} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {axiosInstance, LOGIN_URL} from "./session/Session";

export default function App() {

  useEffect( ()=> {
    const test_login = async () => {
      const login = '';
      const password = '';
      const loginData =
          'ctl00_ctl00_ScriptManager1_HiddenField=&' +
          '__EVENTTARGET=&' +
          '__EVENTARGUMENT=&' +
          '__VIEWSTATE=&' +
          '__VIEWSTATEGENERATOR=&' +
          'ctl00_ctl00_TopMenuPlaceHolder_TopMenuContentPlaceHolder_MenuTop3_menuTop3_ClientState=&' +
          'ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtIdent=' +
          login +
          '&' +
          'ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24txtHaslo=' +
          password +
          '&' +
          'ctl00%24ctl00%24ContentPlaceHolder%24MiddleContentPlaceHolder%24butLoguj=Zaloguj';

      const response = await axiosInstance.post(
          LOGIN_URL,{data: loginData}
      );
      //Redirect KierunkiStudiow
    }
    test_login()
  },[])

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
