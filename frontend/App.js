import { StatusBar } from "expo-status-bar";
import Homescreen from "./screens/Homescreen";
import Chatscreen from "./screens/Chatscreen";
import Messagescreen from "./screens/Messagescreen";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GlobalState from "./context";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GlobalState>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Homescreen">
          <Stack.Screen
            name="Homescreen"
            component={Homescreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chatscreen"
            component={Chatscreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Messagescreen"
            component={Messagescreen}
            options={{
              headerTitle: "Chat",
              headerBackTitle: "Back",
              headerStyle: { backgroundColor: "#703efe" },
              headerTintColor: "#fff",
              headerTitleStyle: { fontWeight: "bold" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar hidden={true} />
    </GlobalState>
  );
}
