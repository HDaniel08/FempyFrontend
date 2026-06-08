import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReportsScreen from "../features/reports/screens/ReportsScreen";
import ReportDetailScreen from "../features/reports/screens/ReportsDetailScreen";


const Stack = createNativeStackNavigator();

export default function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="ReportsStack"
        component={ReportsScreen}
        options={{ title: "Riportok" }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          title: "Riport részletek",
          headerShown: true,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
