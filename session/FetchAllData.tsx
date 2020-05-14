import { AsyncStorage } from "react-native";
import fetchGrades from "./FetchGrades";
import fetchSchedule from "./FetchSchedule";
import fetchUserData from "./FetchUserData";
import { Session } from "./Session";

const fetchAllData = async () => {
  var axiosInstance = await Session.getInstance();

  // TODO: check for changes in schedule and notify user
  console.log("fetchAllData()\n\tfetchSchedule()");

  // Fetch Schedule
  const schedule = await fetchSchedule(axiosInstance);
  const scheduleJSON = JSON.stringify(schedule);
  await AsyncStorage.setItem("scheduleTableJSON", scheduleJSON);
  console.log("\tschedule fetched");

  // Fetch Grades
  console.log("\tfetchGrades()");
  const grades = await fetchGrades(axiosInstance);
  const gradesJSON = JSON.stringify(grades);
  await AsyncStorage.setItem("gradesJSON", gradesJSON);
  console.log("\tgrades fetched");

  // Fetch UserData
  console.log("\tfetchUserData()");
  const userData = await fetchUserData(axiosInstance);
  const userDataJSON = JSON.stringify(userData);
  await AsyncStorage.setItem("userDataJSON", userDataJSON);
  console.log("\tUserData fetched");
};

export default fetchAllData;
