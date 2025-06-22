// src/screens/SetupScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';

export default function SetupScreen({ route, navigation }) {
  const { defaultScore } = route.params;
  const [playerCount, setPlayerCount] = useState('1');
  const [names, setNames] = useState(['']);
  const [legs, setLegs] = useState('1');
  const [sets, setSets] = useState('1');
  const [doubleIn, setDoubleIn] = useState(false);
  const [doubleOut, setDoubleOut] = useState(false);
  const [startingScore, setStartingScore] = useState(String(defaultScore));

  useEffect(() => {
    const count = parseInt(playerCount, 10) || 1;
    setNames(names => Array(count).fill('').map((_, i) => names[i] || ''));
  }, [playerCount]);

  const updateName = (index, text) => {
    setNames(names => names.map((n, i) => (i === index ? text : n)));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Game Setup</Text>
      <Text style={styles.label}>Number of Players</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={playerCount}
        onChangeText={setPlayerCount}
      />
      {names.map((n, i) => (
        <TextInput
          key={i}
          style={styles.input}
          placeholder={`Player ${i + 1} Name`}
          placeholderTextColor="#bbb"
          value={n}
          onChangeText={text => updateName(i, text)}
        />
      ))}
      <Text style={styles.label}>Legs</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={legs}
        onChangeText={setLegs}
      />
      <Text style={styles.label}>Sets</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sets}
        onChangeText={setSets}
      />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Double In</Text>
        <Switch value={doubleIn} onValueChange={setDoubleIn} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>Double Out</Text>
        <Switch value={doubleOut} onValueChange={setDoubleOut} />
      </View>
      <Text style={styles.label}>Starting Score</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={startingScore}
        onChangeText={setStartingScore}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('Game', {
            playerCount: parseInt(playerCount, 10),
            names,
            legs: parseInt(legs, 10),
            sets: parseInt(sets, 10),
            doubleIn,
            doubleOut,
            startingScore: parseInt(startingScore, 10),
          })
        }
      >
        <Text style={styles.buttonText}>Start Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#2E4453',
    padding: 20,
    alignItems: 'stretch',
  },
  header: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#405A72',
    color: 'white',
    borderRadius: 6,
    padding: 12,
    marginVertical: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#27AE60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
