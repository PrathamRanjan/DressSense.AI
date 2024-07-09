import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, Button, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../Utils/Colors';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { toRating } from '../../../firebase/firebase';

export default function RatingScreen({ navigation }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageurl, setImageurl] = useState("");
    const [image, setImage] = useState('');
    const [ratingModalVisible, setRatingModalVisible] = useState(false); // New state for rating modal visibility
    const [ratingResult, setRatingResult] = useState(null); // State to store the rating result

    const handleUpload = async () => {
        setIsModalVisible(true);
    };

    const promptUserForImageSource = async (source) => {
        setIsModalVisible(true);
        if (source === 'camera') {
            await handleCameraUpload();
        } else {
            await handleGalleryUpload();
            setIsModalVisible(false);
        }
    };

    const handleCameraUpload = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            setIsModalVisible(false);
            if (!result.canceled) {
                setImage(result.uri);
                toRating(result.uri)
                    .then(imageFromPython => {
                        console.log("Async value of toRating:",imageFromPython);
                        // Set the rating result
                        setRatingResult(imageFromPython);
                    })
                    .catch(error => {
                        console.error("Error:", error);
                    });
            }
        } catch (error) {
            console.log("Error:", error);
        }
    };

    const handleGalleryUpload = async () => {
        try{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
      
        setIsModalVisible(false);
        if (!result.canceled) {
            setImage(result.uri);
            toRating(result.uri)
                .then(imageFromPython => {
                    console.log("Async value of toRating:",imageFromPython);
                    // Set the rating result
                    setRatingResult(imageFromPython);
                })
                .catch(error => {
                    console.error("Error:", error);
                });
        }
    } catch (error) {
        console.log("Error:", error);
    }
    };

    const generateRating = () => {
        setRatingModalVisible(true);
    };
    const handleCancel = () => {
        setImage('');
        setImageurl('');
        setRatingResult(null);
        setRatingResult(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Rate your outfit</Text>
            </View>
            <View style={styles.textContainer}>
                {image ? (
                    <TouchableOpacity style={styles.preview} onPress={handleUpload}>
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.upload} onPress={handleUpload}>
                        <Icon name="cloud-upload-outline" size={100} color={Colors.BLUE} />
                        <Text style={styles.attach}> Browse </Text>
                    </TouchableOpacity>
                )}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={generateRating} style={styles.upload_button}>
                        <Text style={styles.buttonText}>Rate it!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancel_button} onPress={handleCancel}>
                        <Text style={styles.buttonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 }}>
                        <Text style={{ marginBottom: 20 }}>Choose Image Source</Text>
                        <Button title="Take Photo" onPress={() => promptUserForImageSource('camera')} />
                        <Button title="Choose from Gallery" onPress={() => promptUserForImageSource('gallery')} />
                        <Button title="Close" onPress={() => setIsModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            {/* Rating Modal */}
            <Modal
                visible={ratingModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setRatingModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, elevation: 5 }}>
                        {!image && <Text style={{fontSize: 24,fontFamily:'outfit',textAlign: 'center', marginBottom: 10, padding:5}}>No picture has been uploaded</Text>}
                        {image && <Text style={{ fontSize: 24,fontFamily:'outfit', fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color:Colors.BLUE }}>Here's what I think!</Text>}
                        {ratingResult && <Text style={{fontSize: 18,fontFamily:'outfit',textAlign: 'center', marginBottom: 10, padding:5}}>{ratingResult}</Text>}
                        <Button title="Close" onPress={() => setRatingModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BLUE,
        paddingTop: '14%',
        padding: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'space-between',

    },
    headerText: {
        fontSize: 20,
        color: Colors.WHITE,
        fontFamily: 'outfit-medium',
        marginRight: '32%'
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    upload: {
        height: '50%',
        width: '80%',
        paddingTop: '15%',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 10,
        alignItems: 'center',
        borderColor: Colors.BLUE,
        backgroundColor: Colors.LIGHTEST_BLUE,
    },
    preview:{
        height: '70%',
        width: '90%',
        paddingTop:0,
        
    },
    attach: {
        color: Colors.BLUE,
        fontSize: 20,
        paddingTop: '5%',
        paddingLeft: '4%'
    },
    buttonContainer: {
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: '10%',
    },
    upload_button: {
        borderRadius: 10,
        padding: 15,
        backgroundColor: Colors.BLUE,
        flex: 1,
        marginRight: 40,
    },
    cancel_button: {
        borderRadius: 10,
        padding: 15,
        backgroundColor: Colors.BLUE,
        flex: 1,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
});

