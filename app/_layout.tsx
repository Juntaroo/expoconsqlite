import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { runMigrations } from "../src/db/sqlite";

export default function RootLayout() {
  useEffect(() => {
    try { runMigrations(); } catch (e) { console.error(e); }
  }, []);

  return (
    <PaperProvider theme={MD3LightTheme}>
      <Stack />
    </PaperProvider>
  );
}
