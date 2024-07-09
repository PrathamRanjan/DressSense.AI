import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Modal, Button, FlatList, Image, ScrollView, Pressable  } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../../Utils/Colors.js';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { toFirebase, showClothes, updateDescription, deleteClothes, toMarketPlace } from '../../../../firebase/firebase.jsx';



export default function MarketplaceScreenHeader({ navigation }) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [image, setImage] = useState('');
    const [imageurl, setImageurl] = useState('');
    const [data, setData] = useState([]);
    const [previewImageUri, setPreviewImageUri] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const previewImage = (uri) => {
        setPreviewImageUri(uri);
        setIsPreviewVisible(true);
    };

    const closeModal = () => {
        setIsPreviewVisible(false);
    };

    const handleUpload = async () => {
        setIsModalVisible(true);
    };

    const handleGalleryUpload = async () => {
        try{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
            const url = await toMarketPlace(result.uri);
            console.log("the url is: ", url);
        }
    } catch (error) {
        console.log("Error:", error);
    }
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
            // Check if permission to access camera is granted
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
            if (status !== 'granted') {
                alert('Sorry, we need camera permissions to make this work!');
                return;
            }
    
            // Launch camera to take a picture
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            setIsModalVisible(false);
            if (!result.canceled) {
                setImage(result.uri);
                let string = await toMarketPlace(result.uri);
                console.log("Result of toMarketPlace: ", string);
                /* const dic = convertToDictionary(string) */
                setData(string);
            }
        } catch (error) {
            console.log("Error:", error);
        }
    };

    return (

        <View style={styles.container}>
        <View style={styles.HEAD}>
             <View style={styles.headerContainer}>
                 <TouchableOpacity onPress={() => navigation.goBack()}>
                     <Icon name="arrow-back" size={30} color={Colors.WHITE} />
                </TouchableOpacity>
                <Text style={styles.headerText}>MarketPlace</Text>
             </View>
            <View style={styles.searchBarContainer}>
                <TextInput placeholder='Search' style={styles.textInput}/>
                <FontAwesome name="search" style={styles.searchbtn} size={24} color={Colors.BLUE} />
            </View>
        </View>
            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                    <Icon name="add" size={44} color={Colors.WHITE} />
            </TouchableOpacity> 
            <Modal
                visible={isModalVisible}
                animationType="none"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Choose Image Source</Text>
                        <Button title="Take Photo" onPress={() => promptUserForImageSource('camera')} />
                        <Button title="Choose from Gallery" onPress={() => promptUserForImageSource('gallery')} />
                        <Button title="Close" onPress={() => setIsModalVisible(false)} />
                    </View>
                </View>
            </Modal>
            <FlatList
                data={data}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <View style={styles.itemContainer} >
                        <TouchableOpacity onPress={()=> previewImage(item.primaryPhotoURL)}>
                            <Image source={{ uri: item.primaryPhotoURL }} style={styles.itemImage} />
                        </TouchableOpacity>
                        <Modal
                            visible={isPreviewVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setIsPreviewVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.previewModalContent} >
                                    <Image source={{uri: previewImageUri}} style={styles.previewImage} />
                                    <Pressable style={styles.closeButton} onPress={() => setIsPreviewVisible(false)}>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>{item.currentPrice}</Text>
                    </View>
                )}
            />      
        </View>




    );
}

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.LIGHT_GRAY,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        fontFamily:'outfit',

    },
    previewModalContent: {
        backgroundColor: 'transparent',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        fontFamily:'outfit',
        width: '80%', // Adjust modal width
        height: '80%', // Adjust modal height
        justifyContent: 'center',
        alignItems: 'center',

    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    modalTitle: {
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily:'outfit'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemPrice: {
        fontSize: 14,
        color: Colors.BLUE,
    },
    HEAD:{
        backgroundColor: Colors.BLUE,
        padding: 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    container:{
        flex: 1,
        flexDirection: 'column',
    },

    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BLUE,
        paddingTop: '14%',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'space-between',

    },
    headerText: {
        fontSize: 20,
        color: Colors.WHITE,
        fontFamily: 'outfit-medium',
        marginRight:'32%'
    },
    textContainer: {
        justifyContent:'center' ,
        flex: 1, 
        alignItems: 'center' 
    },
    searchBarContainer:{
        marginTop:25,
        display:'flex',
        flexDirection:'row',
        gap:10,
        marginBottom:10,
        width: '100%',
        marginBottom:20
    },
    searchbtn:{
        backgroundColor:Colors.WHITE,
        padding:10,
        borderRadius:8,
    },
    textInput:{
        padding:7,
        paddingHorizontal:16,
        backgroundColor:Colors.WHITE,
        borderRadius:8,
        width:'85%',
        fontSize:16,
        fontFamily:'outfit'
    },
    uploadButton: {
        bottom: 20,
        right: 20,
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: Colors.BLUE,
        width: 70,
        height: 70,
        borderRadius: 80,
        shadowColor: 'black', // Add shadow properties
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,

    },
    previewContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        color:'transparent',
        top: 20,
        right: 20,
        backgroundColor:'transparent',
        size:10000,
        height: '100%',
        width: '100%'
    },
    previewImage: {
        width: '100%',
        height: '45%',
        resizeMode: 'cover',
        borderRadius: '200%'
        /* backgroundColor: 'white' */
    }
});