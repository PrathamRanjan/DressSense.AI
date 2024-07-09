import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput, Modal, Button, FlatList, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../Utils/Colors';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { toFirebase, showClothes, updateDescription, deleteClothes } from '../../../firebase/firebase.jsx';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

export default function ClosetScreen({ navigation }) {
    const [sortOption, setSortOption] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [image, setImage] = useState(false);
    const [newDescription, setNewDescription] = useState('');
    const [clothesData, setClothesData] = useState([]);
    const [editClothesId, setEditClothesId] = useState('');
    const [selectedClothes, setSelectedClothes] = useState('');
    const [isOptionsModalVisible, setIsOptionsModalVisible] = useState('');
    const [filteredClothes, setFilteredClothes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { unsubscribe, clothes } = await showClothes();
                setClothesData(clothes || []);
                setFilteredClothes(clothes || []);
                setIsLoading(false);
                return unsubscribe;
            } catch (error) {
                console.error("Error fetching clothes data:", error);
            }
        };
    
        const unsubscribe = fetchData();
    
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const handleClothesOptions = (item) => {
        setSelectedClothes(item);
        setIsOptionsModalVisible(true);
    };

    const handleUpload = async () => {
        setIsModalVisible(true);
    };

    const handleSaveDescription = async (item) => {
        try {
            await updateDescription(item, newDescription);
            setIsEditModalVisible(false);
            setNewDescription('');
        } catch (error) {
            console.error('Error saving description:', error);
        }
    };

    const handleDelete = async (item) => {
        await deleteClothes(item);
        setIsOptionsModalVisible(false);
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

    const handleSearchChange = (text) => {
        setSearchText(text);
        const filtered = clothesData.filter(item =>
            item.description.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredClothes(filtered);
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
                await toFirebase(result.uri);
            }
        } catch (error) {
            console.error("Error in handleCameraUpload: ", error)
        };
    };

    const handleGalleryUpload = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.uri);
            await toFirebase(result.uri);
        }
    };

    const handleEdit = async (item) => {
        setIsOptionsModalVisible(false);
        setEditClothesId(item.id);
        setIsEditModalVisible(true);
    };
        
    const handleSort = (option) => {
        setSortOption(option);
    };

    return (
        <View style={styles.container}>
            <View style={styles.HEAD}>
                <View style={styles.headerContainer}> 
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} color={Colors.WHITE} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Closet</Text>
                </View>
                <View style={styles.searchBarContainer}>
                    <TextInput placeholder='Search' style={styles.textInput} onChangeText={handleSearchChange} />
                    <FontAwesome name="search" style={styles.searchbtn} size={24} color={Colors.BLUE} />
                </View>
            </View>
            <ScrollView>
                <View style={styles.imageContainer}>
                    <FlatList
                        data={filteredClothes}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handleClothesOptions(item)}>
                                <View style={styles.clotheItem}>
                                    <Image source={{ uri: item.downloadUrl }} style={styles.clotheImage} />
                                    <Text style={styles.clotheText}>{item.description}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                    />
                </View>
            </ScrollView>
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
            <Modal
                visible={isEditModalVisible}
                animationType="none"
                transparent={true}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter New Description:</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter new description"
                            value={newDescription} 
                            onChangeText={setNewDescription}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setIsEditModalVisible(false)} />
                            <Button title="Save" onPress={() => handleSaveDescription(editClothesId)} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                visible={isOptionsModalVisible}
                animationType="none"
                transparent={true}
                onRequestClose={() => setIsOptionsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Options for Clothes</Text>
                        <Button title="Modify Description" onPress={() => handleEdit(selectedClothes)} />
                        <Button title="Delete" onPress={() => handleDelete(selectedClothes)} />
                        <Button title="Cancel" onPress={() => setIsOptionsModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    HEAD: {
        backgroundColor: Colors.BLUE,
        padding: 10,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BLUE,
        paddingTop: '10%',
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 25,
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 20,
        color: Colors.WHITE,
        fontFamily: 'outfit-medium',
        marginRight: '43%',
        paddingTop: 10
    },
    searchBarContainer: {
        marginTop: 15,
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
        padding:10
    },
    textInput: {
        padding: 7,
        paddingHorizontal: 16,
        backgroundColor: Colors.WHITE,
        borderRadius: 8,
        width: '85%',
        fontSize: 16,
        fontFamily: 'outfit',
    },
    searchbtn: {
        backgroundColor: Colors.WHITE,
        padding: 10,
        borderRadius: 8,
    },
    imageContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    clotheItem: {
        backgroundColor: Colors.LIGHT_BLUE,
        width: 200,
        height: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 20,
        marginTop: 10,
        marginLeft:10,
        shadowColor: 'black', // Add shadow properties
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    clotheImage: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 5,
    },
    clotheText: {
        fontSize: 16,
        fontFamily: 'outfit-medium',
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
    },
    modalTitle: {
        marginBottom: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalInput: {
        marginBottom: 20,
        padding: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
