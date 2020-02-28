import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, Text, AsyncStorage } from 'react-native';

import { Button, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';

import { connect } from 'react-redux';

function HomeScreen({ navigation, storePseudo }, props) {
	const [pseudo, setPseudo] = useState('');

	// FUNCTION WHEN VALIDATING PSEUDO
	const onPressSavePseudo = (pseudo) => {
		AsyncStorage.setItem('pseudo', pseudo); // local storage
		storePseudo(pseudo); // redux
		navigation.navigate('Map'); // navigation
	};

	// HOOK GET PSEUDO FROM LOCAL STORAGE
	useEffect(() => {
		AsyncStorage.getItem('pseudo', function(error, storageData) {
			setPseudo(storageData);
			storePseudo(storageData);
		});
	}, []);

	// WELCOME TITLE AND BUTTON
	var welcomeTitle;
	var welcomeButton;
	if (pseudo === undefined || pseudo === null || pseudo === '') {
		welcomeTitle = (
			<Input
				containerStyle={{ marginBottom: 25, width: '70%' }}
				inputStyle={{ marginLeft: 10 }}
				placeholder='John'
				leftIcon={<Icon name='user' size={24} color='#eb4d4b' />}
				onChangeText={(val) => setPseudo(val)}
			/>
		);
		welcomeButton = (
			<Button
				icon={<Icon name='arrow-right' size={20} color='#eb4d4b' />}
				iconRight={true}
				title='Go to Map'
				titleStyle={{ marginRight: 5 }}
				type='solid'
				onPress={() => {
					onPressSavePseudo(pseudo);
				}}
			/>
		);
	} else {
		welcomeTitle = (
			<Text style={{ paddingTop: 50, paddingBottom: 20, textAlign: 'center' }}>
				Welcome back {pseudo} !
			</Text>
		);
		welcomeButton = (
			<Button
				icon={<Icon name='arrow-right' size={20} color='#eb4d4b' />}
				iconRight={true}
				title='Proceed to Map'
				titleStyle={{ marginRight: 5 }}
				type='solid'
				onPress={() => {
					navigation.navigate('Map');
				}}
			/>
		);
	}

	// RETURN PRINCIPAL
	return (
		<ImageBackground
			source={require('../assets/home.jpg')}
			style={styles.container}
		>
			{welcomeTitle}
			{welcomeButton}
		</ImageBackground>
	);
}

// STYLES
const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});

// REDUX STATES
function mapStateToProps(state) {
	return { pseudo: state.pseudo };
}

// REDUX DISPATCH
function mapDispatchToProps(dispatch) {
	return {
		storePseudo: function(pseudo) {
			dispatch({ type: 'savePseudo', pseudo: pseudo });
		}
	};
}

// EXPORT
export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
