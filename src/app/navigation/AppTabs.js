import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth} from "../auth/AuthContext";

import ReportStack from "./ReportStack";

import LeadershipStack from "./LeadershipStack";
import HomeStack from "./HomeStack";
import AccountStack from "./AccountStack";
import CustomTabBar from "./CustomTabBar";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { user } = useAuth();
  const isLeader = !!user?.isLeader;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // fontos: az alap tabbar-t teljesen kiváltjuk
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <CustomTabBar {...props} isLeader={isLeader} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: "Főoldal", tabBarIconName: "home-variant-outline" }}
      />

      <Tab.Screen
        name="Reports"
        component={ReportStack}
        options={{ tabBarLabel: "Riportok", tabBarIconName: "file-chart-outline" }}
      />

      {/* Csak leadernek */}
     {isLeader ? (
  <Tab.Screen
    name="Leadership"
    component={LeadershipStack}
    options={{ tabBarLabel: "Vezetés", tabBarIconName: "account-tie-outline" }}
  />
) : null}

      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{ tabBarLabel: "Fiók", tabBarIconName: "account-circle-outline" }}
      />
    </Tab.Navigator>
  );
}