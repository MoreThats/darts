// src/screens/VictoryScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function VictoryScreen({ route, navigation }) {
  const {
    winner,
    order = [],
    legWins = [],
    setWins = [],
    pointsScored = [],
    rounds = []
  } = route.params;

  // Seřadíme hráče tak, aby vítěz byl první
  const sortedPlayers = [
    winner,
    ...order.filter(name => name !== winner)
  ];

  // Pomocná funkce pro zobrazení statistik podle jména
  const statsByName = name => {
    const idx = order.indexOf(name);
    const darts = rounds[idx] * 3;
    const avg   = rounds[idx] ? (pointsScored[idx] / rounds[idx]).toFixed(2) : '0.00';
    return {
      legs: legWins[idx],
      sets: setWins[idx],
      darts,
      avg
    };
  };

  return (
    <View style={styles.container}>
      {/* VÍTĚZ */}
      <Text style={styles.title}>🏆 Victory! 🏆</Text>
      <Text style={styles.winnerName}>{winner}</Text>
      <View style={styles.statsRow}>
        {(() => {
          const s = statsByName(winner);
          return (
            <>
              <StatBlock label="Legs" value={`${s.legs}`} />
              <StatBlock label="Sets" value={`${s.sets}`} />
              <StatBlock label="Darts" value={`${s.darts}`} />
              <StatBlock label="Avg"   value={`${s.avg}`} />
            </>
          );
        })()}
      </View>

      {/* OSTATNÍ HRÁČI */}
      <Text style={styles.subtitle}>Other players</Text>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sortedPlayers.slice(1).map(name => {
          const s = statsByName(name);
          return (
            <View key={name} style={styles.playerRow}>
              <Text style={styles.playerName}>{name}</Text>
              <View style={styles.playerStats}>
                <Text style={styles.statText}>Legs: {s.legs}</Text>
                <Text style={styles.statText}>Sets: {s.sets}</Text>
                <Text style={styles.statText}>Darts: {s.darts}</Text>
                <Text style={styles.statText}>Avg: {s.avg}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// Malá komponenta pro jednu statistiku
function StatBlock({ label, value }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E4453',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  winnerName: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 14,
  },
  subtitle: {
    color: 'white',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  playerRow: {
    backgroundColor: '#3B5770',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  playerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
