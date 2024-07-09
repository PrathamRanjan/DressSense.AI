import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import RegisterScreen from '../Screens/RegistrationScreen/RegisterScreen';
import LoginScreen from '../Screens/LoginScreen/Login';
import HomeScreen from '../Screens/HomeScreen/HomeScreen';

const Stack = createStackNavigator();

export default function LoginNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name = 'login-screen' component={LoginScreen} />
      <Stack.Screen name = 'register-screen' component={RegisterScreen} />
      <Stack.Screen name='home' component={HomeScreen} />

    </Stack.Navigator>
  )
}