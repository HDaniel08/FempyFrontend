import React from "react";

import RootNavigator from "./src/app/navigation/RootNavigator";
import { AuthProvider } from "./src/app/auth/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
