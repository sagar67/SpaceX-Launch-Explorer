import "./ReactotronConfig";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LaunchListScreen from "./screens/LaunchListScreen";
import LaunchDetailsScreen from "./screens/LaunchDetailsScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { Provider } from "react-redux";
import { index } from "./store";

type RootStackParamList = {
  Launches: undefined;
  LaunchDetails: { launch: { launchpad: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={index}>
      <ErrorBoundary>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Launches"
              component={LaunchListScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="LaunchDetails"
              component={LaunchDetailsScreen}
              options={{ title: "Launchpad Details" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </Provider>
  );
}
