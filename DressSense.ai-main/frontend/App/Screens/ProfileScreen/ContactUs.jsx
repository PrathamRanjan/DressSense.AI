import { View, TouchableOpacity, Text, StyleSheet, ViewBase } from 'react-native';
import Colors from '../../Utils/Colors';
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 

export default function ContactUs() {

  const Navigation = useNavigation()

  return (
    <View style={styles.container}>
            <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => Navigation.goBack()}>
                <Icon name="arrow-back" size={30} color={Colors.WHITE} />
            </TouchableOpacity>
            <Text style={styles.headerText}>About Us</Text>
            </View>
            <View style={styles.textContainer}>
                <View style={styles.contactContainer}>
                    <View style={styles.email}>
                    <Icon name="mail" size={35} color={Colors.BLUE} />
                        <Text style={styles.subheading}>Email:</Text>
                        <Text style={styles.placeholderText}>dresssense1@gmail.com {'\n'}dresssense2@gmail.com</Text>
                    </View>
                    <View style={styles.email}>
                    <Icon name="call" size={35} color={Colors.BLUE} />
                        <Text style={styles.subheading}>Phone Number:</Text>
                        <Text style={styles.placeholderText}>+65 9123 4567 {'\n'}+65 9234 5678 </Text>
                    </View>
                    <View style={styles.email}>
                    <Icon name="location" size={35} color={Colors.BLUE} />
                        <Text style={styles.subheading}>Address:</Text>
                        <Text style={styles.placeholderText}>128, Dawson Road {'\n'}Singapore 142089</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    email:{
        alignItems: 'center', // Center align the items vertically
        borderBottomColor: 'lightblue',
        borderBottomWidth:2,
        borderRadius: 10,
        paddingTop: 1,
        marginBottom: 20
    },
    Text:{
        flex: 1, // Take remaining width
        paddingVertical: 15,
        paddingHorizontal: 10,
        color: Colors.BLUE, // Adjust text color as needed
        fontSize:20
    },
    placeholderText:{
        flex: 1, // Take remaining width
        color: Colors.BLUE, // Adjust text color as needed
        fontSize:15,
        paddingBottom:60,
        paddingTop:20,


    },

    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.BLUE,
        paddingTop: '14%',
        padding:20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        justifyContent: 'space-between',

    },
    headerText: {
        fontSize: 20,
        color: Colors.WHITE,
        fontFamily: 'outfit-medium',
        marginRight:'39%'
    },
    textContainer: {
        justifyContent:'center' ,
        alignItems: 'center',
    },

    contactContainer: {
        width: '80%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height:'50%'
    },
    subheading: {
        fontSize: 20,
        color: Colors.BLUE,
        marginRight: '70%',
        fontWeight:'bold',
        position: 'left',

        
    },

});