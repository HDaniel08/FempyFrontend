import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import MoodWidget from "../widgets/MoodWidget";
import GoalsCarouselWidget from "../widgets/GoalsCarouselWidget";
import DailyQuestionnaireWidget from "../widgets/DailyQuestionnaireWidget";
import { colors } from "../../../../theme/colors";
import { useAuth } from "../../../auth/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenShell from "../../../ui/ScreenShell";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {




  return (
   <ScreenShell>
   
    <ScrollView
      style={{paddingBottom: "110px" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
    
      <MoodWidget />
      <GoalsCarouselWidget />
      <DailyQuestionnaireWidget navigation={navigation} />
    </ScrollView>
    </ScreenShell>
    
  );
}