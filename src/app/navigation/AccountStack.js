import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AccountScreen from "../features/settings/screens/AccountScreen"
const Stack = createNativeStackNavigator();

export default function AccountStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AccountStack" component={AccountScreen} options={{ title: "Fiók" }} />
    </Stack.Navigator>
  );
}