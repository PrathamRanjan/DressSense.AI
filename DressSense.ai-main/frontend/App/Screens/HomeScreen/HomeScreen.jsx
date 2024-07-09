import { View, Text } from 'react-native'
import React from 'react'
import Header from './Header'
import Slider from './Slider'
import Features from './Features'
import { ScrollView } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={{flex:1}}>
      {/* Header  */}
      <Header/>
      <ScrollView>

      <View style={{padding:10}}>

        {/* Features  */}
        <Features/>

        {/* Slider  */}
        <Slider/>

      </View>
      </ScrollView>
    </View>
  )
}