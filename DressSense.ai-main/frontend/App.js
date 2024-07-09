import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigation from './App/Navigations/TabNavigation';
import { useFonts } from 'expo-font';
import LoginNavigation from './App/Navigations/LoginNavigation';

export default function App() {
  const [fontsLoaded] = useFonts({
    'outfit': require('./assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./assets/fonts/Outfit-Medium.ttf'),
    'outfit-bold': require('./assets/fonts/Outfit-Bold.ttf'),
  });

  if (!fontsLoaded) {
    // Return a loading indicator or null while fonts are loading
    return null;
  }

  return (
    <NavigationContainer>
      <ClerkProvider publishableKey='pk_test_ZGVsaWNhdGUtaGVycmluZy0wLmNsZXJrLmFjY291bnRzLmRldiQ'>
        <View style={styles.container}>
          <SignedIn>
            <TabNavigation />
          </SignedIn>
          <SignedOut>
          <LoginNavigation/> 
          </SignedOut>
        </View>
      </ClerkProvider>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
