import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Colors from '../Utils/Colors'

export default function Heading({text,isViewAll=false}) {
  return (
    <View style={styles.container}>
       <Text style={styles.heading}>
        {text}
       </Text>
      {isViewAll&& <Text style={{color:Colors.BLUE}}>View All</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    heading:{
        fontSize:25,
        fontFamily:'outfit-medium',
        marginBottom:10,
        marginTop: 3
    },
})