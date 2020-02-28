import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, AsyncStorage } from 'react-native';
import { Button, Overlay, Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import MapView, { Marker } from 'react-native-maps'; // Map et Marker
import * as Location from 'expo-location'; // géolocalisation
import * as Permissions from 'expo-permissions'; // demande de permission
import { connect } from 'react-redux';
import socketIOClient from 'socket.io-client'; // Import du module client socket.io

var socket = socketIOClient('http://YOURIPADRESS:3000'); // Init websocket

function MapScreen(props) {
	// ETATS
	const [currentLat, setCurrentLat] = useState(0);
	const [currentLon, setCurrentLon] = useState(0);
	const [region, setRegion] = useState({
		latitude: 45.75,
		longitude: 4.85,
		latitudeDelta: 0.005,
		longitudeDelta: 0.038
	});
	const [addPOI, setAddPOI] = useState(false);
	const [currentPOI, setCurrentPOI] = useState({ lat: 0, lon: 0 });
	const [listPOI, setListPOI] = useState([{ lat: 0, lon: 0 }]);
	const [overlayVisible, setOverlayVisible] = useState(false);
	const [titlePOI, setTitlePOI] = useState('A special place');
	const [descPOI, setDescPOI] = useState('This is a cool point of interest');
	const [userPositions, setUserPositions] = useState([{ lat: 0, lon: 0 }]);

	// HOOK SET & SEND GEOLOCALISATION
	useEffect(() => {
		async function askPermissions() {
			var { status } = await Permissions.askAsync(Permissions.LOCATION);
			if (status === 'granted') {
				Location.watchPositionAsync({ distanceInterval: 1 }, (location) => {
					setCurrentLat(location.coords.latitude);
					setCurrentLon(location.coords.longitude);
					// setRegion({
					// 	latitude: location.coords.latitude,
					// 	longitude: location.coords.longitude,
					// 	// Initialisation du zoom (Delta)
					// 	latitudeDelta: 0.0922,
					// 	longitudeDelta: 0.0421
					// });
					socket.emit('sendPosition', {
						lat: location.coords.latitude,
						lon: location.coords.longitude,
						pseudo: props.pseudo
					});
				});
			}
		}
		askPermissions();
		AsyncStorage.getItem('allPOI', function(err, data) {
			if (JSON.parse(data) !== null) {
				setListPOI(JSON.parse(data));
			}
		});
	}, []);

	// HOOK GET ALL USER POSITIONS FROM BACK
	useEffect(() => {
		socket.on('getUserPositionsFromBack', (newPosition) => {
			var copyUserPositions;
			if (userPositions.some((user) => user.pseudo === newPosition.pseudo)) {
				copyUserPositions = userPositions.filter(
					(user) => user.pseudo !== newPosition.pseudo
				);
			} else {
				copyUserPositions = userPositions;
			}
			setUserPositions([
				...copyUserPositions,
				{
					lat: newPosition.lat,
					lon: newPosition.lon,
					pseudo: newPosition.pseudo
				}
			]);
		});
	}, [userPositions]); // Le hook se déclanchera uniquement à la màj de l'état message

	// ALL USERS POSITIONS MARKERS
	var userMarkers = userPositions.map(function(item, i) {
		if (item.lat !== 0 && item.lon !== 0) {
			return (
				<Marker
					coordinate={{
						latitude: item.lat,
						longitude: item.lon
					}}
					key={i}
					pinColor='green'
					title={item.pseudo}
					description='Last updated position'
				/>
			);
		}
	});

	// ADD A POI ACTION
	const onPressAddPOI = () => {
		if (currentPOI.lat !== 0) {
			setAddPOI(false);
			var copyListPOI = [
				...listPOI,
				{
					lat: currentPOI.lat,
					lon: currentPOI.lon,
					title: titlePOI,
					desc: descPOI
				}
			];
			setListPOI(copyListPOI);
			AsyncStorage.setItem('allPOI', JSON.stringify(copyListPOI));
			setCurrentPOI({ lat: 0, lon: 0 });
			setTitlePOI('A special place');
			setDescPOI('This is a cool point of interest');
		}
	};

	// CURRENT USER POSITION MARKER
	var currentMarker;
	if (currentLat !== 0) {
		currentMarker = (
			<Marker
				coordinate={{
					latitude: currentLat,
					longitude: currentLon
				}}
				title='Hello'
				description='I am here'
			/>
		);
	}

	// CURRENT POI MARKER
	var currentPOIMarker;
	if (currentPOI.lat !== 0) {
		currentPOIMarker = (
			<Marker
				draggable
				coordinate={{
					latitude: currentPOI.lat,
					longitude: currentPOI.lon
				}}
				title='Temporary marker'
				description='Click save to validate this POI'
			/>
		);
	}

	// ALL POI MARKERS
	var POImarkers = listPOI.map(function(item, i) {
		if (item.lat !== 0 && item.lon !== 0) {
			return (
				<Marker
					coordinate={{
						latitude: item.lat,
						longitude: item.lon
					}}
					key={i}
					pinColor='blue'
					title={item.title}
					description={item.desc}
				/>
			);
		}
	});

	// BOUTONS ADD ET VALIDATE POI
	var POIbuttons;
	if (addPOI === false) {
		POIbuttons = (
			<Button
				buttonStyle={{ backgroundColor: '#E84F4E' }}
				icon={<Icon name='map-marker' size={20} color='#ffffff' />}
				title='Add POI'
				titleStyle={{ marginLeft: 5 }}
				type='solid'
				onPress={() => {
					setAddPOI(true);
				}}
			/>
		);
	} else if (addPOI === true) {
		POIbuttons = (
			<Button
				buttonStyle={{ backgroundColor: 'limegreen' }}
				icon={<Icon name='edit' size={20} color='#ffffff' />}
				title='Save POI'
				titleStyle={{ marginLeft: 5 }}
				type='solid'
				onPress={() => {
					if (currentPOI.lat !== 0 && currentPOI.lon !== 0) {
						setOverlayVisible(true);
					} else {
						setAddPOI(false);
					}
				}}
			/>
		);
	}

	// Overlay
	var overlayPOI = (
		<Overlay
			fullScreen={true}
			isVisible={overlayVisible}
			windowBackgroundColor='rgba(255, 255, 255, .5)'
			width='auto'
			height='auto'
			onBackdropPress={() => setOverlayVisible(false)}
		>
			<View>
				<Text
					style={{ paddingTop: 50, paddingBottom: 20, textAlign: 'center' }}
				>
					Save your POI
				</Text>
				<Input
					containerStyle={{ marginBottom: 25, width: '100%' }}
					inputStyle={{ marginLeft: 10 }}
					placeholder='Title'
					leftIcon={<Icon name='pencil' size={24} color='#eb4d4b' />}
					onChangeText={(val) => setTitlePOI(val)}
				/>
				<Input
					containerStyle={{ marginBottom: 25, width: '100%' }}
					inputStyle={{ marginLeft: 10 }}
					placeholder='Description'
					leftIcon={<Icon name='pencil' size={24} color='#eb4d4b' />}
					onChangeText={(val) => setDescPOI(val)}
				/>
				<Button
					buttonStyle={{ backgroundColor: 'limegreen' }}
					icon={<Icon name='check' size={20} color='#ffffff' />}
					title='Validate POI'
					titleStyle={{ marginLeft: 5 }}
					type='solid'
					onPress={() => {
						onPressAddPOI();
						setOverlayVisible(false);
					}}
				/>
			</View>
		</Overlay>
	);

	// RETURN PRINCIPAL
	return (
		<View style={{ flex: 1 }}>
			{overlayPOI}
			<MapView
				style={{ flex: 1 }}
				initialRegion={region}
				onPress={(e) => {
					if (addPOI === true) {
						setCurrentPOI({
							lat: e.nativeEvent.coordinate.latitude,
							lon: e.nativeEvent.coordinate.longitude
						});
					}
				}}
			>
				{POImarkers}
				{currentPOIMarker}
				{currentMarker}
				{userMarkers}
			</MapView>
			{POIbuttons}
		</View>
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

// REDUX
function mapStateToProps(state) {
	return { pseudo: state.pseudo };
}

// EXPORT
export default connect(mapStateToProps, null)(MapScreen);
