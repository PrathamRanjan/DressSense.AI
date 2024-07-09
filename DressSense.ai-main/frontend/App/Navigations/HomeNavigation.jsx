import { View, Text } from 'react-native'
import HomeScreen from '../Screens/HomeScreen/HomeScreen';
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import OutfitRecommenderScreen from '../Screens/FeaturesScreen/OutfitRecommender/OutfitRecommenderPreference';
import ClosetScreen from '../Screens/FeaturesScreen/ClosetScreen';
import RatingScreen from '../Screens/FeaturesScreen/RatingScreen';
import MarketplaceScreenHeader from '../Screens/FeaturesScreen/Marketplace/MarketplaceScreenHeader';
import ChatBotScreen from '../Screens/FeaturesScreen/ChatBotScreen';

const Stack = createStackNavigator();
export default function HomeNavigation() {
  return (
   <Stack.Navigator screenOptions={{
    headerShown:false,
    
   }}>
        <Stack.Screen name='home' component={HomeScreen} />
        <Stack.Screen name='closet-screen' component={ClosetScreen} />
        <Stack.Screen name='marketplace-screen' component={MarketplaceScreenHeader} />
        <Stack.Screen name='rating-screen' component={RatingScreen} />
        <Stack.Screen name='outfit-recommender' component={OutfitRecommenderScreen} />
<Stack.Screen name='chatbot-screen' component={ChatBotScreen}/>

   </Stack.Navigator>
  )
}
