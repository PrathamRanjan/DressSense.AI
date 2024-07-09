import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../Utils/Colors';
import InputWithIcon from '../../Utils/InputWithIcon';

export default function Register() {

    const Navigation = useNavigation();

    return (
        <View style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            <TouchableOpacity onPress={() => Navigation.goBack()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={28} color={Colors.BLUE} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
                <Image source={require('./../../../assets/images/logo.png')} style={styles.loginImage} />
                <View style={styles.subContainer}>
                    <InputWithIcon placeholder="Username" icon="person-outline" />
                    <InputWithIcon placeholder="Email ID" icon="alternate-email" keyboardType="email-address" />
                    <InputWithIcon placeholder="Password" icon="lock" secureTextEntry={true} />
                    <InputWithIcon placeholder="Confirm Password" icon="lock" secureTextEntry={true} />
                    <TouchableOpacity style={styles.button}>
                        <Text style={{ textAlign: 'center', fontSize: 17, color: Colors.WHITE }}>Register</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30, marginTop: 30 }}>
                        <Text>Or Log in with </Text>
                        <TouchableOpacity onPress={() => Navigation.navigate('login-screen')}>
                            <Text style={{ color: '#66B3CC', fontWeight: '700' }}> Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1, 
        
    },
    loginImage: {
        width: '50%',
        height: '40%',
        marginTop: '20%',
    },
    subContainer: {
        width: '80%',
        textAlign: 'left',
        marginTop: 0
    },
    button: {
        padding: 15,
        backgroundColor: Colors.BLUE,
        borderRadius: 99,
        marginTop: 40,
        marginLeft: -10
    },
    register: {
        padding: 15,
        backgroundColor: Colors.DARK_BLUE,
        borderRadius: 99,
        marginTop: '10%',
        marginLeft: -10,
    },
});