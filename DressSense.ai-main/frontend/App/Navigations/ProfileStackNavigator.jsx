import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from '../Screens/ProfileScreen/ProfileScreen';
import ClosetScreen from '../Screens/FeaturesScreen/ClosetScreen';
import ContactUs from '../Screens/ProfileScreen/ContactUs';


const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator >
      <Stack.Screen name = 'profile-tab' component={ProfileScreen} options={{headerShown:false}}/>
      <Stack.Screen name = 'closet' component={ClosetScreen} options={{headerShown:false}}/>
      <Stack.Screen name = 'contactus' component={ContactUs} options={{headerShown:false}}/>
      
    </Stack.Navigator>
  )
}