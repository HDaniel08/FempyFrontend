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
      <Stack.Screen
        name="LeadershipPersonFlow"
        component={LeadershipPersonFlow}
        options={{
          title: "Kolléga helyzete",
          headerShown: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="LeadershipTeamFlow"
        component={LeadershipTeamFlow}
        options={{
          title: "Csapathelyzet",
          headerShown: true,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="LeadershipSelfFlow"
        component={LeadershipSelfFlow}
        options={{
          title: "Saját fejlődés",
          headerShown: true,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
