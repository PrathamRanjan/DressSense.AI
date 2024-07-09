import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useNavigation } from '@react-navigation/native';


export default function ComfortScale({onComfortSelect}) {
  const [value, setValue] = React.useState(0);
  const sheet = React.useRef();

  React.useEffect(() => {
    sheet.current.open();
  }, []);

  
  const ComfortLevel = ({ number }) => {
    const isActive = value === number;
    return (
      <TouchableOpacity onPress={() => setValue(number)}>
        <Text style={[styles.comfortNumber, isActive && styles.activeComfortNumber]}>
          {number}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleConfirm = () => {
    // handle onPress, maybe save the comfort level
    onComfortSelect(value);
    sheet.current.close();
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <RBSheet
        customStyles={{container: styles.sheet}}
        height={440}
        openDuration={250}
        ref={sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetHeaderTitle}>Comfort Preference</Text>
        </View>
        <View style={styles.sheetBody}>
          <View style={styles.group}>
            {Array.from({ length: 5 }, (_, i) => i + 1).map((number) => (
              <ComfortLevel key={number} number={number} />
            ))}
          </View>
          <TouchableOpacity
            style={styles.btn}
            onPress={handleConfirm}>
            <Text style={styles.btnText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </RBSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  comfortNumber: {
    fontSize: 20,
    fontWeight: '300',
    color: '#000',
    marginHorizontal: 20, // Add space between numbers
  },
  activeComfortNumber: {
    fontWeight: 'bold',
    textDecorationLine: 'underline', // Underline the selected number
  },
  
  group: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
 
  /** Sheet */
  sheet: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sheetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  sheetHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sheetBody: {
    padding: 50,
    paddingTop: 100,

  },
  

  /** Button */
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ADD8E6',
    backgroundColor: '#ADD8E6',
    marginBottom: 20,
  },
  btnText: {
    fontSize: 19,
    fontWeight: '600',
    fontFamily: 'outfit-medium',
    color: '#000',
  },
});