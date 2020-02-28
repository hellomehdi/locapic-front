import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, ListItem, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import socketIOClient from 'socket.io-client'; // Import du module client socket.io

var socket = socketIOClient('http://172.16.9.200:3000'); // Init websocket

function ChatScreen(props) {
	// ETATS
	const [currentMessage, setCurrentMessage] = useState('');
	const [messages, setMessages] = useState([]);

	// ACTION SEND MESSAGE TO BACK
	const sendMessage = (message, pseudo) => {
		if (currentMessage !== '') {
			socket.emit('sendMessage', { message: message, pseudo: props.pseudo });
			setCurrentMessage(''); // Reset input
		}
	};

	// HOOK GET ALL MESSAGES FROM BACK
	useEffect(() => {
		socket.on('sendMessageFromBack', (newMessage) => {
			// REGEX
			var editedMessage = newMessage.message
				.replace(/:\)/gi, '\u263A')
				.replace(/:\(/gi, '\uD83D\uDE22')
				.replace(/:p/gi, '\uD83D\uDE1B')
				.replace(/fuck[a-z]*|bitch[a-z]*|ass*/gi, '\u2022\u2022\u2022');
			// AJOUT A LA LISTE
			setMessages([
				...messages,
				{ content: editedMessage, author: newMessage.pseudo }
			]);
		});
	}, [messages]); // Le hook se déclanchera uniquement à la màj de l'état message

	// RETURN LIST OF mESSAGES
	var allMessages = messages.map(function(msg, i) {
		return <ListItem key={i} title={msg.content} subtitle={msg.author} />;
	});

	// RETURN PRINCIPAL
	return (
		<View style={{ flex: 1 }}>
			<ScrollView style={{ flex: 1, marginTop: 15 }}>{allMessages}</ScrollView>

			<KeyboardAvoidingView behavior='padding' enabled>
				<Input
					containerStyle={{ marginBottom: 5 }}
					placeholder='Your message'
					value={currentMessage}
					onChangeText={(val) => setCurrentMessage(val)}
				/>
				<Button
					icon={<Icon name='envelope-o' size={20} color='#ffffff' />}
					title='Send'
					titleStyle={{ marginLeft: 5 }}
					buttonStyle={{ backgroundColor: '#eb4d4b' }}
					type='solid'
					onPress={() => sendMessage(currentMessage, props.pseudo)}
				/>
			</KeyboardAvoidingView>
		</View>
	);
}

// REDUX
function mapStateToProps(state) {
	return { pseudo: state.pseudo };
}

// EXPORT
export default connect(mapStateToProps, null)(ChatScreen);
