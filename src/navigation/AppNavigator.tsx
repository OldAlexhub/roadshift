import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import LoadingScreen      from '../screens/LoadingScreen';
import TutorialScreen     from '../screens/TutorialScreen';
import HomeScreen         from '../screens/HomeScreen';
import DistrictMapScreen  from '../screens/DistrictMapScreen';
import LevelBriefingScreen from '../screens/LevelBriefingScreen';
import DispatchBoardScreen from '../screens/DispatchBoardScreen';
import LiveShiftScreen    from '../screens/LiveShiftScreen';
import ResultsScreen      from '../screens/ResultsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen     from '../screens/SettingsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import AboutScreen        from '../screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Loading"        component={LoadingScreen} />
        <Stack.Screen name="Tutorial"       component={TutorialScreen} />
        <Stack.Screen name="Home"           component={HomeScreen} />
        <Stack.Screen name="DistrictMap"    component={DistrictMapScreen} />
        <Stack.Screen name="LevelBriefing"  component={LevelBriefingScreen} />
        <Stack.Screen name="DispatchBoard"  component={DispatchBoardScreen} />
        <Stack.Screen name="LiveShift"      component={LiveShiftScreen} />
        <Stack.Screen name="Results"        component={ResultsScreen} />
        <Stack.Screen name="Achievements"   component={AchievementsScreen} />
        <Stack.Screen name="Settings"       component={SettingsScreen} />
        <Stack.Screen name="PrivacyPolicy"  component={PrivacyPolicyScreen} />
        <Stack.Screen name="About"          component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
