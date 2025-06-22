// src/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Darts Score Tracker</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Setup', { defaultScore: 501 })}>
        <Text style={styles.buttonText}>Start 501 Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.buttonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2E4453', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: 'white', fontSize: 32, fontWeight: 'bold', marginBottom: 40 },
  button: { backgroundColor: '#27AE60', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 8, marginTop: 16 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});