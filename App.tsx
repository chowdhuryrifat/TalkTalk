import React from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./app/screens/HomeScreen";

export default function App(): React.ReactElement {
  return (
    <>
      <StatusBar style="light" />
      <HomeScreen />
    </>
  );
}
