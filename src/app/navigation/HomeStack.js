import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../features/home/screens/HomeScreen";
import DailyQuestionsScreen from "../features/home/screens/DailyQuestionsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HomeStack"
        component={HomeScreen}
        options={{ title: "Főoldal" }}
      />
      <Stack.Screen
        name="DailyQuestions"
        component={DailyQuestionsScreen}
        options={{
          title: "Napi kérdőív",
          headerShown: true,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
