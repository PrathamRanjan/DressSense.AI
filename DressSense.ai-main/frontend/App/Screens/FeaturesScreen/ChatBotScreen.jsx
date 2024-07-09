import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../../Utils/Colors';




export default function ChatBotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, how can I help you?", sender: "bot" },
    { id: 2, text: "Welcome! Type your query below.", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();



  const sendMessage = (text, sender = "user") => {
    if (text.trim() === '') return;
    
    setMessages(prevMessages => [
      ...prevMessages,
      { id: prevMessages.length + 1, text, sender }
      
    ]);
    


  };

  async function handleSendMessage() {
    try {
      const reply = await sendTextToPython(inputText);
      console.log('Received data:', reply);
      sendMessage(inputText, "user");
      sendMessage(reply, "bot");
      setInputText('');
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    }
  }

  async function sendTextToPython(inputText) {
    try {
        const response = await fetch('http://10.91.173.254:5001/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "Input": inputText}),
        });
        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error('Error sending data to Python backend:', error);
        throw error;
    }
}

  useEffect(() => {
    // Scroll to the bottom of the ScrollView when messages change
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerText}>ChatBot</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollViewContent}
      >
        {messages.map(message => (
          <View
          key={message.id}
          style={[
            styles.messageContainer,
            {
              alignSelf: message.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: message.sender === "user" ? Colors.LIGHT_BLUE : Colors.BLUE,
              borderBottomLeftRadius: message.sender === "user" ? 20 : 5,
              borderBottomRightRadius: message.sender === "user" ? 5 : 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              marginLeft: message.sender === "user" ? 50 : 10, // Add some margin for user messages
              marginRight: message.sender === "bot" ? 50 : 10, // Add some margin for bot messages
            }
          ]}
        >
            <Text style={{fontSize:18, color:Colors.WHITE}}>{message.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What do you want to know?"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendMessage}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BLUE,
    paddingTop: '14%',
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: 'space-between',
    marginBottom: 10
  },
  headerText: {
    fontSize: 20,
    color: Colors.WHITE,
    fontFamily: 'outfit-medium',
    marginRight: '42%'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.BLUE,
    borderTopWidth: 1,
    borderTopColor: Colors.WHITE,
    height: '12%',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    marginRight: 10,
    backgroundColor: Colors.WHITE,
    height: '80%',
    color: Colors.BLACK,
    textAlignVertical: 'center', // Center text vertically
  },
  button: {
    backgroundColor: Colors.LIGHT_BLUE,
    padding: 10,
    borderRadius: 5,
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
  messageContainer: {
    maxWidth: '70%',
    borderRadius: 20,
    marginBottom: 10,
    padding: 10,
  },
  messageText: {
    fontSize: 18,
    color: Colors.WHITE,
  },
});
