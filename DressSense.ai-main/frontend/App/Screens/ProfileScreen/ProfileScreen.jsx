import { View, Text, Image, Linking } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'; 
import { useAuth, useUser } from '@clerk/clerk-expo';
import Colors from './../../Utils/Colors'
import { FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
 
  const {user}=useUser();
  const navigation=useNavigation();
  const { isLoaded,signOut } = useAuth();
 const profileMenu=[
  {
    id:1,
    name:'My Closet',
    icon:'shirt',
    path:'closet'
  },
  {
    id:2,
    name:'Contact Us',
    icon:'mail',
    path:'contactus'
  },
  {
    id:3,
    name:'Logout',
    icon:'log-out'
  }
 ]

  const onMenuPress=(item)=>{
    if(item.name=='Logout'){
        signOut();
      return ;
    }
    item?.path?navigation.navigate(item.path):null;
  }

  return (
    <View>
    <View style={{padding:20,paddingTop:50, backgroundColor:Colors.BLUE}}>
     <Text style={{fontSize:30,fontFamily:'outfit-bold',color:Colors.WHITE}}>Profile</Text>
      <View style={{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        padding:20,
       
      }}>
        <Image source={{uri:user.imageUrl}}
        style={{width:90,height:90, borderRadius:99}}
        />
        <Text style={{fontSize:26,marginTop:8,fontFamily:'outfit-medium',
      color:Colors.WHITE}}>{user.fullName}</Text>
       <Text style={{fontSize:18,marginTop:8,fontFamily:'outfit-medium',
      color:Colors.WHITE}}>{user?.primaryEmailAddress.emailAddress}</Text>
      </View>
    </View>

    <View style={{paddingTop:60}}>
      <FlatList
      data={profileMenu}
      renderItem={({item,index})=>(
        <TouchableOpacity 
        onPress={()=>onMenuPress(item)}
        style={{display:'flex',flexDirection:'row',
        alignItems:'center',gap:10,marginBottom:50,
        paddingHorizontal:100,
        }}>
          <Ionicons name={item.icon} size={35} color={Colors.BLUE} />
          <Text style={{fontFamily:'outfit',
        fontSize:20,}}>{item.name}</Text>
        </TouchableOpacity>
      )}
      />
    </View>
    </View>
  )
}