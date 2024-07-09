import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from '../../hooks/warmUpBrowser';
WebBrowser.maybeCompleteAuthSession();
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InputWithIcon from '../../Utils/InputWithIcon';

export default function Login({navigation}) {
    useWarmUpBrowser();
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const onPress = React.useCallback(async () => {
        console.log("SCO")
        try {
          const { createdSessionId, signIn, signUp, setActive } =
            await startOAuthFlow();
     
          if (createdSessionId) {
            setActive({ session: createdSessionId });
          } else {
            // Use signIn or signUp for next steps such as MFA
          }
        } catch (err) {
          console.error("OAuth error", err);
        }
    }, []);


    return (
        <View style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
            <View style={{alignItems:'center'}}>
                <Image source={require('./../../../assets/images/logo.png')} 
                    style={styles.loginImage}
                />
                <View style={styles.subContainer}>
                <InputWithIcon placeholder="Email ID" icon="alternate-email" keyboardType="email-address" />
                <InputWithIcon placeholder="Password" icon="lock" secureTextEntry={true}/>
                <TouchableOpacity>
                        <Text style={{textAlign:'right',fontSize:14,marginTop:10,marginRight:5,color:'#66B3CC'}}>Forgot?</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={onPress}>
                        <Text style={{textAlign:'center',fontSize:17,color:Colors.WHITE}}>Log In</Text>
                    </TouchableOpacity>        
                    <TouchableOpacity style={styles.button} onPress={onPress}>
                        <Text style={{textAlign:'center',fontSize:17,color:Colors.WHITE}}>Log In With Google</Text>
                    </TouchableOpacity>

                    <View style={{flexDirection: 'row', justifyContent: 'center',marginBottom: 30,marginTop:30 }}>
                        <Text>New to the app?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('register-screen')}>
                          <Text style={{color: '#66B3CC', fontWeight: '700'}}> Register</Text>
                        </TouchableOpacity>


                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  
    loginImage:{
        width:'50%',
        height:'40%',
        marginTop:'20%',
    },
    subContainer:{
        width:'80%',
        textAlign: 'left',
        marginTop:0
    },
    button:{
        padding:15,
        backgroundColor:Colors.BLUE,
        borderRadius:99,
        marginTop:'5%',
        marginLeft:-10
    },
});
