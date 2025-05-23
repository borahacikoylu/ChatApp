import { StatusBar } from "expo-status-bar";
import Homescreen from "./screens/Homescreen";
import Chatscreen from "./screens/Chatscreen";
import Messagescreen from "./screens/Messagescreen";
import Profilescreen from "./screens/Profilescreen"; 

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GlobalState from "./context";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

// Özel sayfa geçiş animasyonları
const screenOptions = {
  headerStyle: {
    backgroundColor: "#5D5FEF",
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "600",
  },
  headerShadowVisible: false,
  animation: 'slide_from_right',
  animationTypeForReplace: 'push',
  presentation: 'card',
  gestureEnabled: true,
  transitionSpec: {
    open: { 
      animation: 'timing', 
      config: { 
        duration: 300 
      } 
    },
    close: { 
      animation: 'timing', 
      config: { 
        duration: 300 
      } 
    },
  },
};

export default function App() {
  return (
    <GlobalState>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Homescreen" 
          screenOptions={screenOptions}
        >
          <Stack.Screen
            name="Homescreen"
            component={Homescreen}
            options={{ 
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Chatscreen"
            component={Chatscreen}
            options={{ 
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Messagescreen"
            component={Messagescreen}
            options={({ navigation }) => ({
              headerTitle: "",
              headerBackTitle: "Geri",
              headerBackTitleVisible: false,
              headerLeft: () => (
                <Ionicons 
                  name="chevron-back" 
                  size={24} 
                  color="#fff" 
                  style={{ marginRight: 10 }}
                  onPress={() => navigation.goBack()}
                />
              ),
              animation: 'slide_from_right',
            })}
          />
          <Stack.Screen
            name="Profilescreen"
            component={Profilescreen} // ✅ Buraya eklendi
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </GlobalState>
  );
}