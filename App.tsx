import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import {
  OnboardingScreen,
  BirthInputScreen,
  AstroResultScreen,
  PartnerInviteScreen,
  WaitingRoomScreen,
  BlindModeScreen,
  SynchronizationScreen,
  InsightDropScreen,
  BuffsScreen,
  WishesScreen,
  SettingsScreen,
} from './src/screens/PlaceholderScreens';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  BirthInput: undefined;
  AstroResult: { birthData: any };
  PartnerInvite: undefined;
  WaitingRoom: { inviteCode: string };
  BlindMode: undefined;
  Synchronization: undefined;
  InsightDrop: { result: any };
  Dashboard: undefined;
  Buffs: undefined;
  Wishes: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0a0a0b' }
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="BirthInput" component={BirthInputScreen} />
          <Stack.Screen name="AstroResult" component={AstroResultScreen} />
          <Stack.Screen name="PartnerInvite" component={PartnerInviteScreen} />
          <Stack.Screen name="WaitingRoom" component={WaitingRoomScreen} />
          <Stack.Screen name="BlindMode" component={BlindModeScreen} />
          <Stack.Screen name="Synchronization" component={SynchronizationScreen} />
          <Stack.Screen name="InsightDrop" component={InsightDropScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Buffs" component={BuffsScreen} />
          <Stack.Screen name="Wishes" component={WishesScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
