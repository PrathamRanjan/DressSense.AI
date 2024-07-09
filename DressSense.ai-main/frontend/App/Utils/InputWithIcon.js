import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons from expo/vector-icons

export default function InputWithIcon({ placeholder, icon, ...rest }) {
  return (
    <View style={styles.inputContainer}>
      <MaterialIcons name={icon} size={20} color="#666" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        style={styles.inputField}
        placeholderTextColor="lightblue"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row', // Arrange icon and text horizontally
    alignItems: 'center', // Center align the items vertically
    borderBottomColor: 'lightblue',
    borderBottomWidth:2,
    borderRadius: 10,
    marginTop: 5,
  },
  icon: {
    marginRight: 5,
    marginLeft:5
  },
  inputField: {
    flex: 1, // Take remaining width
    paddingVertical: 15,
    paddingHorizontal: 10,
    color: 'black', // Adjust text color as needed
  },
});
