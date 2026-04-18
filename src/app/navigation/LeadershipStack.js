import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LeadershipScreen from "../features/leadership/screens/LeadershipScreen";
import LeadershipPersonFlow from "../features/leadership/screens/LeadershipPersonFlow";
import LeadershipTeamFlow from "../features/leadership/screens/LeadershipTeamFlow";
import LeadershipSelfFlow from "../features/leadership/screens/LeadershipSelfFlow";


const Stack = createNativeStackNavigator();

export default function LeadershipStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeadershipHome" component={LeadershipScreen} options={{ title: "Vezetés" }} />
      <Stack.Screen name="LeadershipPersonFlow" component={LeadershipPersonFlow} />
      <Stack.Screen name="LeadershipTeamFlow" component={LeadershipTeamFlow} />
      <Stack.Screen name="LeadershipSelfFlow" component={LeadershipSelfFlow} />
    </Stack.Navigator>
  );
}