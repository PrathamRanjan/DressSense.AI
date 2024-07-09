import React, { useState } from 'react';
import {  View, TouchableOpacity, Text, StyleSheet, TextInput, StatusBar, Modal, Button, TouchableWithoutFeedback, SafeAreaView, ScrollView,KeyboardAvoidingView} from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import { ColorPicker } from 'react-native-color-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../../Utils/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ColorScale from './ColorScale.jsx';
import ComfortScale from './ComfortScale.jsx';
import { Image } from 'react-native';


export default function OutfitRecommenderPreference({ navigation }) {
    // const [value, setValue] = React.useState(0);
    const [selectedOccasion, setSelectedOccasion] = useState(null);
    const [otherEvent, setOtherEvent] = useState('');
    const [color, setColor] = useState(null);
    const [comfortLevel, setComfortLevel] = useState(5); // Assuming a scale of 1 to 10
    const [otherRequirement, setOtherRequirement] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedGender, setSelectedGender]= useState(null);
    const maleIconName = 'ios-man-outline';
    const femaleIconName = 'ios-woman-outline'; 

    const handleGenerate = () => {
      console.log("new: " + color)
      console.log(selectedOccasion, color , comfortLevel, otherRequirement);

      setIsModalVisible(true);
      handleOpenModal();
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const handleOpenModal = () => {
      // Assume you have image URLs stored in an array called imageURLs
      setImageUrls(imageUrls);
      setIsModalVisible(true);

  };
    const occasions = [
        'Formal Event',
        'Sporting Event',
        'Casual Event',
        'University Class',
        'First Date'
    ];
    const gender = [
      'Male',
      'Female'
    ]
    const GenderIcon = ({ gender }) => {
      if (gender === 'Male') {
        return <FontAwesome name="mars" size={24} style={styles.icon} />;
      } else if (gender === 'Female') {
        return <FontAwesome name="venus" size={24} style={styles.icon} />;
      }
      return null;
    };
    //select occasion
    const handleSelectOccasion = (occasion) => {
        if (selectedOccasion === occasion) {
        setSelectedOccasion(null);
        } else {
        setSelectedOccasion(occasion);
        }
    };

    const handleSelectGender = (gender) => {
      if (selectedGender === gender) {
      setSelectedGender(null);
      } else {
        setSelectedGender(gender);
      }
  };


    const onColorChange = newColor => {
      setColor(newColor);
      console.log("new color is " , newColor);
  };
    const handleComfortSelect = (level) => {
      setComfortLevel(level);
    };

      async function handleGenerateOutfit() {
        console.log(color)
        
          try {
            console.log(selectedGender, selectedOccasion, color , comfortLevel, otherRequirement);
            const send = await sendTextToPython(color,comfortLevel, selectedOccasion,otherRequirement, selectedGender);
            return send;
        } catch (error) {
            console.error('send Error sending image to Python backend:', error);
            throw error;
        }  
    }
      
    async function sendTextToPython(color, comfortLevel, selectedOccasion, otherRequirement, selectedGender) {
      try {
        console.log('data = ', color, comfortLevel, selectedOccasion, otherRequirement, selectedGender);
          const response = await fetch('http://10.91.173.254:5001/generateoutfits', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ "color_preference": color, "comfort_level": comfortLevel, "occasion": selectedOccasion, "other_comments": otherRequirement , "gender": selectedGender}),
          });
          const data = await response.json();
          console.log('data outfit:', data.outfits);
          const newImageUrls =[
            data.outfits[0],
            data.outfits[1],
            data.outfits[2]
          ];
          setImageUrls(newImageUrls);
          console.log("Image URLs:", newImageUrls);
          setIsModalVisible(true)

          return data.outfits;
      } catch (error) {
          console.error('Error sending data to Python backend:', error);
          throw error;
      }
  }

    //ColorScale & ComfortScale
    const [showColorScale, setShowColorScale] = useState(false);
    
    const handleColorScaleButtonClick = () => {
        setShowColorScale(!showColorScale); 
    };



    const [showComfortScale, setShowComfortScale] = useState(false);
    const handleComfortScaleButtonClick = () => {
        setShowComfortScale(!showComfortScale); 
    };

  return (
    <>
       <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Recommender</Text>
            </View>
        </View>
        <View>
        <ScrollView style={styles.content}>
        <View style={styles.selectorContainer}>
              <Text style={styles.subHeader1}>Select Gender :</Text>
              {gender.map((gender, index) => (
                  <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => handleSelectGender(gender)}
                  >
                  <GenderIcon gender={gender} />
                  <View style={selectedGender === gender ? styles.optionSelected : styles.optionUnselected} />
                  </TouchableOpacity>
              ))}
          </View>
          <View style={styles.selectorContainer}>
              <Text style={styles.subHeader1}>Select Occasion :</Text>
              {occasions.map((occasion, index) => (
                  <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => handleSelectOccasion(occasion)}
                  >
                  <Text style={styles.optionText}>{occasion}</Text>
                  <View style={selectedOccasion === occasion ? styles.optionSelected : styles.optionUnselected} />
                  </TouchableOpacity>
              ))}
          </View>
      
          {/* ColorScale&ComfortSCale */}

          <View style={styles.scaleContainer}>
          <Text style={styles.subHeader}>Select Color Palette :</Text>
          
              <TouchableOpacity style={styles.button} onPress={handleColorScaleButtonClick}>
                  <Text style={styles.buttonText}>Color Scale</Text>
              </TouchableOpacity>
              {showColorScale && <ColorScale onColorSelect={onColorChange} />}
              <Text style={styles.subHeader}>Select Comfort Level :</Text>
              <TouchableOpacity style={styles.button} onPress={handleComfortScaleButtonClick}>
                  <Text style={styles.buttonText}>Comfort Scale</Text>
              </TouchableOpacity>
              {showComfortScale && <ComfortScale onComfortSelect={handleComfortSelect} />}
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View>
          <TextInput
            style={styles.input}
            width='80%'
            marginLeft= '10%'
            padding='5%'
            placeholder="Any Other Requirements eg: Button, Collar, etc"
            value={otherRequirement} // Set the value of the input to the state
            onChangeText={text => setOtherRequirement(text)}
          />
            </View>
          </KeyboardAvoidingView >
          <TouchableOpacity style={styles.outfit_button} onPress={handleGenerateOutfit}>
            <Text style={styles.buttonText}>Generate Outfit</Text>
          </TouchableOpacity>

          <Modal
    visible={isModalVisible}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setIsModalVisible(false)}
>
    <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
            <Text style={styles.modalText}>This is what I'm feeling!</Text>
            {imageUrls.map((url, index) => (
                <Image key={index} source={{ uri: url }} style={styles.clothesImage} />
            ))}
            <Button title="Close" onPress={handleCloseModal} />
        </View>
    </View>
</Modal>
        </ScrollView>
      </View>
    </>
    
  );
}

const styles = StyleSheet.create({
//Header and text container
    container: {
        paddingTop: StatusBar.currentHeight || 35, 
        backgroundColor: Colors.BLUE,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BLUE,
        paddingVertical: 15,
        paddingLeft:20, 
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'space-between',
        width: '100%',
    },
    headerText: {
        fontSize: 20,
        color: Colors.WHITE,
        fontFamily: 'outfit-medium',
        marginRight:'35%',
    },
    clothesImage: {
      width: 150,
      height: 150,
      borderRadius: 8,
      marginBottom: 5,
    }, 
    textContainer: {
        justifyContent:'center' ,
        flex: 1, 
        alignItems: 'center' 
    },
//Occasion Selector
selectorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 2,
    paddingVertical: 0, 
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    // justifyContent: 'space-between',
    width: '80%',
    // marginLeft: 15,

},
subHeader1:{
  fontSize: 18,
  fontWeight: '600',
  color: Colors.BLACK,
  marginTop: 20,
  marginBottom: 10,
  textAlign: 'center',
  fontFamily: 'outfit-medium',
  paddingLeft: 85,
},
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.BLACK,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
  },
  option: {
    flexDirection: 'row',
    marginTop: 15,
  },
  optionText: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'outfit-medium',
    color: Colors.DARK_BLUE,
    marginLeft:75,
  },
  //text input for occasion selector
  input: {
    borderWidth: 1,
    borderColor: Colors.LIGHT_BLUE,
    padding: 10,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    color: Colors.DARK_BLUE,
  },
  optionSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.BLUE,
  },
  optionUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.BLUE,
  },
  //ColorScale
  scaleContainer: {
    flexDirection: 'column',
    paddingLeft: '7%',
    paddingRight: '7%',
    justifyContent: 'space-between',
    paddingBottom: 4,
    
  },
  button: {
    backgroundColor: Colors.LIGHT_BLUE,
    padding: 20,
    borderRadius: 20,
    marginTop: 15,
    marginBottom: 15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,  
  },
  outfit_button:{
    backgroundColor: Colors.BLUE,
    padding: 20,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 40,
    marginTop: 15,
    marginBottom: 15, 
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, 

  },
  buttonText: {
    color: Colors.BLACK,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    width: '100%',
    fontSize: 16,

  },
  content: {
    marginBottom: 100,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0)',
},
  modalContent: {
      backgroundColor: Colors.WHITE,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      borderWidth: 0.5, // Add border properties
      borderColor: Colors.BLUE, // Border color
  },
  modalText: {
    fontSize: 24,
    fontFamily:'outfit', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 10, 
    color:Colors.BLUE,
    paddingBottom: 10,
  },

  // Modify the clothesImage style in your styles object
  clothesImage: {
  width: 200, // Adjust the width to your desired size
  height: 200, // Adjust the height to your desired size
  borderRadius: 8,
  marginBottom: 10, // Increase or decrease the margin as needed
  borderWidth: 0.5, // Add border properties
  borderColor: Colors.BLUE, // Border color
},
icon: {
  marginRight: 35, 
  marginLeft:85,
  color:Colors.DARK_BLUE,
},

});