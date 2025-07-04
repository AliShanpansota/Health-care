import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import DashboardScreen from './screens/DashboardScreen';
import DoctorHome from './screens/DoctorHome';
import PatientHome from './screens/PatientHome';
import ProfileScreen from './screens/ProfileScreen';
import PatientHealthDataScreen from './screens/PatientHealthDataScreen';
import DoctorPatientHealthDataScreen from './screens/DoctorPatientHealthDataScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import ChatScreen from './screens/ChatScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding" // Set the initial route
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="DoctorHome" component={DoctorHome} />
        <Stack.Screen name="PatientHome" component={PatientHome} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen
          name="PatientHealthDataScreen"
          component={PatientHealthDataScreen}
        />
        <Stack.Screen
          name="DoctorPatientHealthDataScreen"
          component={DoctorPatientHealthDataScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});