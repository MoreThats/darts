// src/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  // Načtení historie při mountu
  useEffect(() => {
    (async () => {
      try {
        const json    = await AsyncStorage.getItem('gameHistory');
        const data    = json ? JSON.parse(json) : [];
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load history', e);
        setHistory([]);
      }
    })();
  }, []);

  // Funkce na smazání jednoho záznamu podle indexu
  const handleDelete = async idx => {
    Alert.alert(
      'Smazat záznam?',
      'Opravdu chceš tento zápas vymazat z historie?',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Smazat',
          style: 'destructive',
          onPress: async () => {
            try {
              const newHist = history.filter((_, i) => i !== idx);
              await AsyncStorage.setItem(
                'gameHistory',
                JSON.stringify(newHist)
              );
              setHistory(newHist);
            } catch (e) {
              console.error('Failed to delete entry', e);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>No games played yet.</Text>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {history.map((game, idx) => (
            <View key={idx} style={styles.entry}>
              {/* tlačítko na smazání */}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(idx)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.entryTitle}>Game {idx + 1}</Text>
              <Text style={styles.entryText}>
                Date: {new Date(game.date).toLocaleString()}
              </Text>

              {/* rozbalené detailní statistiky pro každý zápas */}
              <View style={styles.playersList}>
                {game.order?.map((name, i) => {
                  const legs   = game.legWins?.[i]       ?? 0;
                  const sets    = game.setWins?.[i]       ?? 0;
                  const darts   = (game.rounds?.[i] ?? 0) * 3;
                  const avg     = game.rounds?.[i]
                    ? (game.pointsScored[i] / game.rounds[i]).toFixed(2)
                    : '0.00';
                  return (
                    <View key={i} style={styles.playerRow}>
                      <Text style={styles.playerName}>{name}</Text>
                      <Text style={styles.playerStats}>
                        Legs: {legs}  Sets: {sets}  Darts: {darts}  Avg: {avg}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#2E4453', padding: 20 },
  title:        { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  empty:        { color: 'white', fontSize: 16, textAlign: 'center', marginTop: 40 },
  list:         { flex: 1, marginBottom: 20 },
  listContent:  { paddingBottom: 20 },
  entry:        { backgroundColor: '#3B5770', padding: 12, borderRadius: 8, marginBottom: 12 },
  entryTitle:   { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  entryText:    { color: 'white', fontSize: 14, marginBottom: 8 },
  deleteBtn:    {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 10,
  },
  deleteText:   { color: 'white', fontSize: 16, fontWeight: 'bold' },

  playersList:  { marginTop: 4 },
  playerRow:    { marginBottom: 6 },
  playerName:   { color: 'white', fontSize: 16, fontWeight: '600' },
  playerStats:  { color: 'white', fontSize: 14 },

  button:       { backgroundColor: '#27AE60', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, alignSelf: 'center' },
  buttonText:   { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
