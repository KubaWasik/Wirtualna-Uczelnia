import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import React from "react";
import { MaterialCommunityIcons } from "react-native-vector-icons";
import GradesScreen from "./GradesScreen";
import ScheduleScreen from "./ScheduleScreen";
import SettingsScreen from "./SettingsScreen";
import UserDataScreen from "./UserDataScreen";

type StackParamList = {
  Schedule: undefined;
  Grades: undefined;
  UserData: undefined;
  Settings: undefined;
};

const Tab = createMaterialBottomTabNavigator<StackParamList>();

export default function HomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Schedule"
      activeColor="white"
      backBehavior="history"
    >
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: "Plan",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={20} />
          ),
          tabBarColor: "#1e88e5",
        }}
      />
      <Tab.Screen
        name="Grades"
        component={GradesScreen}
        options={{
          tabBarLabel: "Oceny",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="table-large"
              color={color}
              size={20}
            />
          ),
          tabBarColor: "#00c853",
        }}
      />
      <Tab.Screen
        name="UserData"
        component={UserDataScreen}
        options={{
          tabBarLabel: "Profil",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={20} />
          ),
          tabBarColor: "#dd2c00",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Ustawienia",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="settings" color={color} size={20} />
          ),
          tabBarColor: "#ffab00",
        }}
      />
    </Tab.Navigator>
  );
}
