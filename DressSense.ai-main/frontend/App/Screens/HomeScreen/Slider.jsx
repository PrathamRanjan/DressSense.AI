import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableWithoutFeedback, Linking } from 'react-native';
import Heading from '../../Components/Heading';
import fashionTips1 from './../../../assets/images/fashiontips3.png'; // Import the image
import fashionTips2 from './../../../assets/images/fashiontips1.png'; // Import the image

export default function Slider() {
  // Define the images array with imported images
  const images = [fashionTips1, fashionTips2];

  // Function to handle image press
  const handleImagePress = (url) => {
    Linking.openURL(url);
  };

  return (
    <View>
      <Heading text={'Fashion Guide'} />
      <FlatList
        data={images} // Use the images array as data source
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableWithoutFeedback onPress={() => handleImagePress(index === 0 ? 'https://www.realsimple.com/holidays-entertaining/entertaining/everyday-celebrations/host-swap-party' : 'https://helpshoe.com/fix-shoes-at-home/')}>
            <View style={{ marginRight: 20 }}>
              <Image
                source={item} // Use item directly as image source
                style={styles.sliderImage}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
        keyExtractor={(item, index) => index.toString()} // Specify a unique key extractor
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontFamily: 'outfit-medium',
    marginBottom: 10,
  },
  sliderImage: {
    width: 270,
    height: 150,
    borderRadius: 20,
    resizeMode: 'cover', // Specify the resizeMode
  },
});
