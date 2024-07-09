import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Heading from '../../Components/Heading';
import Colors from '../../Utils/Colors';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native'

// Import your category images from your project directory
import CategoryImage1 from './../../../assets/images/closet.png';
import CategoryImage2 from './../../../assets/images/marketplace.png';
import CategoryImage3 from './../../../assets/images/rating.png';
import CategoryImage4 from './../../../assets/images/recommender.png';
import CategoryImage5 from './../../../assets/images/chatbot.png';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        setCategories([
            { name: 'Closet', image: CategoryImage1, screen: 'closet-screen' },
            { name: 'Marketplace', image: CategoryImage2, screen: 'marketplace-screen' },
            { name: 'Rating', image: CategoryImage3, screen: 'rating-screen' },
            { name: 'Recommender', image: CategoryImage4, screen: 'outfit-recommender' },
            { name: 'Chatbot', image: CategoryImage5, screen: 'chatbot-screen' },

        ]);
    }, []);

    const handleCategoryPress = (screen) => {
        navigation.navigate(screen);
    };

    return (
        <ScrollView>
            <View style={styles.container}>
                <Heading text={'Features'} />
                <View style={styles.categoriesContainer}>
                    <View style={styles}>
                        {categories.slice(0, 2).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.itemContainer}
                                onPress={() => handleCategoryPress(item.screen)}>
                                <View style={styles.iconContainer}>
                                    <Image source={item.image} style={styles.image} />
                                
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles}>
                        {categories.slice(2, 4).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.itemContainer}
                                onPress={() => handleCategoryPress(item.screen)}>
                                <View style={styles.iconContainer}>
                                    <Image source={item.image} style={styles.image} />
                                
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles}>
                        {categories.slice(4, 5).map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.itemContainer}
                                onPress={() => handleCategoryPress(item.screen)}>
                                <View style={styles.iconContainer}>
                                    <Image source={item.image} style={styles.image} />
                                
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
            </ScrollView>
        );
    }

const styles = StyleSheet.create({
    container: {
        marginTop: 5,
    },

    categoriesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap:'wrap'
    },
    itemContainer: {
        marginRight: 30,
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: Colors.LIGHT_BLUE,
        width: 150,
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginBottom: 20,
        marginTop:10,
        shadowColor: 'black', // Add shadow properties
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 10,
        marginLeft: '1.8%',
    },
    image: {
        height: 80,
        width: 80,
        resizeMode: 'contain',
    },
    categoryName: {
        fontFamily: 'outfit-medium',
        marginTop: 0,
        marginBottom: 13
    },



});