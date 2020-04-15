import React from "react";
import { ScrollView, AsyncStorage } from "react-native";
import { List } from "react-native-paper";
import fetchGrades, { IGrade } from "../session/FetchGrades";
import { ScaledSheet } from "react-native-size-matters";
import {axiosInstance, LOGIN_URL} from "../session/Session";
import cheerio from "react-native-cheerio";


function GradesScreen() {
  const [gradesTable, setGradesTable] = React.useState<IGrade[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const useOffline = await AsyncStorage.getItem("offlineMode");
      const gradesFromMemory = await AsyncStorage.getItem("gradesJSON");
      var grades: IGrade[];

      console.log("Offline mode: " + useOffline);

      if (useOffline && useOffline === "true") {
        if (gradesFromMemory) {
          grades = JSON.parse(gradesFromMemory);
        }
      } else {
        grades = await fetchGrades();
      }

      setGradesTable(grades);

      if ((grades && JSON.stringify(grades) !== gradesFromMemory) || (grades && !gradesFromMemory)) {
        if(gradesFromMemory===""){
          //TO DO ignoring empty values in case of not allowed data 
          const json = JSON.stringify("N/A");
        }
        const json = JSON.stringify(grades);
        
        await AsyncStorage.setItem("gradesJSON", json);
      }


    };

    fetchData();
  }, []);

  
  return (
    <ScrollView>
      {gradesTable.map((element) => (
        <List.Item
          key={element.index}
          title={element.courseName}
          description={`${element.type}, ${element.graduator}, ${element.numberOfHours}, ${element.firstTerm}, ${element.corrective}, ${element.comission}, ${element.ects}`}
        />
      ))}
    </ScrollView>
  );
}

export default GradesScreen;