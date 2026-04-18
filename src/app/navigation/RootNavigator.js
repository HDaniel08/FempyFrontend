import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../auth/AuthContext";
import LoginScreen from "../features/auth/screens/LoginScreen";
import AppTabs from "./AppTabs";


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isBooting, isAuthenticated } = useAuth();

  if (isBooting) return null; // később: SplashScreen

  return (
   
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <Stack.Screen name="App" component={AppTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>

  );
}