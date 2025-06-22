// src/screens/GameScreen.js
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';

const PRESETS = [
  { label: 'T', multiplier: 3 },
  { label: 'D', multiplier: 2 },
  { label: 'S', multiplier: 1 },
  { label: 'N', multiplier: null }, 
];
const KEYS_MANUAL = [
  ['1','2','3'],
  ['4','5','6'],
  ['7','8','9'],
  ['⌫','0','OK']
];

export default function GameScreen({ route, navigation }) {
  const { names: initialNames, startingScore, legs, sets } = route.params;
  const playerCount = initialNames.length;
    // dynamické rozměry karet podle počtu hráčů
  let cardWidth, cardAspect;
  if (playerCount === 1) {
    cardWidth  = '90%';   cardAspect = 1.1; 
  } else if (playerCount === 2) {
    cardWidth = '90%';     cardAspect = 2.2;       // 1 velká karta
  } else if (playerCount === 3) {
    cardWidth = '43%';     cardAspect = 1.1;     // 3 karty vedle sebe
  } else if (playerCount === 4) {
    cardWidth = '44%';     cardAspect = 1.1;     // 2×2
  } else {
    cardWidth = '35%';     cardAspect = 1.1;     // default pro 5+
  }
  const cardStyleOverride = { width: cardWidth, aspectRatio: cardAspect };

  // --- Stavy pro hru (karty, skóre, legy, sety, rotace) ---
  const [order, setOrder]             = useState(initialNames);
  const [scores, setScores]           = useState(
    Array(playerCount).fill().map(() => Array(legs).fill(startingScore))
  );
  const [legWins, setLegWins]         = useState(Array(playerCount).fill(0));
  const [setWins, setSetWins]         = useState(Array(playerCount).fill(0));
  const [currentLeg, setCurrentLeg]   = useState(0);
  const [rounds, setRounds]           = useState(Array(playerCount).fill(0));
  const [pointsScored, setPointsScored] = useState(Array(playerCount).fill(0));
  const rotate = arr => [...arr.slice(1), arr[0]];
  

  // --- Nová část: kalkulačka + presety ---
  const [selectedPreset, setSelectedPreset] = 
  useState(PRESETS.find(p => p.label === 'N'));
  const [inputTotal, setInputTotal]         = useState(0);
  

async function submitThrow(val) {
  if (isNaN(val) || val <= 0 || val > 180) {
    return Alert.alert('Invalid throw', 'Enter a number between 1 and 180');
  }

   const currentScore = scores[0][currentLeg];
  if (val > currentScore) {
    Alert.alert('Bust!', 'Throw exceeds remaining score');
    setInputTotal(0);
    // otočíme tah na dalšího hráče
    setOrder(prev => rotate(prev));
    setScores(prev => rotate(prev));
    setLegWins(prev => rotate(prev));
    setSetWins(prev => rotate(prev));
    setRounds(prev => rotate(prev));
    setPointsScored(prev => rotate(prev));
    return;
  }
  // 1) Příprava kopií stavů
  const newScores   = scores.map(r => [...r]);
  const newRounds   = [...rounds];
  const newPoints   = [...pointsScored];

  newScores[0][currentLeg] -= val;
  newRounds[0]++;
  newPoints[0] += val;

  // 2) Pokud někdo právě shozením na nulu ukončil leg...
  if (newScores[0][currentLeg] === 0) {
    // a) vyhraje leg
    const lw = [...legWins];
    lw[0]++;
    setLegWins(lw);

    // b) pokud vyhrál dost leg na celkový set
    if (lw[0] === legs) {
      const sw = [...setWins];
      sw[0]++;
      setSetWins(sw);

      // c) pokud vyhrál i dost setů → konec zápasu
      if (sw[0] === sets) {
        // uložíme záznam do AsyncStorage
        // 1) připravíme nový záznam historie
const entry = {
  // kdy a kdo vyhrál
  date:        new Date().toISOString(),
  winner:      order[0],

  // snapshot celého pořadí a statistik
  order:       [...order],           // pole jmen hráčů v aktuálním pořadí
  legWins:     [...lw],              // pole počtů vyhraných legů
  setWins:     [...sw],              // pole počtů vyhraných setů
  rounds:      [...newRounds],       // pole odehraných kol (3 hody = 1 runda)
  pointsScored:[...newPoints],       // pole součtů bodů hozených ve všech rundách

  // pro vítěze ještě zvlášť přepočítané summary
  legsWon:     lw[0],
  setsWon:     sw[0],
  darts:       newRounds[0] * 3,
  average:     newRounds[0]
               ? (newPoints[0] / newRounds[0]).toFixed(2)
               : '0.00',
};


        try {
          const json    = await AsyncStorage.getItem('gameHistory');
          const history = json ? JSON.parse(json) : [];
          history.push(entry);
          await AsyncStorage.setItem(
            'gameHistory',
            JSON.stringify(history)
          );
        } catch (e) {
          console.error('Failed to save history', e);
        }

        // TADY zůstane pouze návrat do Victory screenu
        return navigation.replace('Victory', {
  winner: order[0],
  order,
  legWins,
  setWins,
  pointsScored,
  rounds
});

      }

      // d) zápas nekončí, reset legů a půjdeme na další set
      setLegWins(Array(playerCount).fill(0));
      setCurrentLeg(0);
      newScores.forEach(r => r[0] = startingScore);
    } else {
      // e) pouze další leg ve stejném setu
      const nextLeg = currentLeg + 1;
      newScores.forEach(r => r[nextLeg] = startingScore);
      setCurrentLeg(nextLeg);
    }
  }

  // 3) Tohle už se vykoná jen pokud ZÁPAS nekončil:
  setScores(newScores);
  setRounds(newRounds);
  setPointsScored(newPoints);
  setInputTotal(0);

  // 4) A otočíme hráče na další hod
  setOrder(prev => rotate(prev));
  setScores(prev => rotate(prev));
  setLegWins(prev => rotate(prev));
  setSetWins(prev => rotate(prev));
  setRounds(prev => rotate(prev));
  setPointsScored(prev => rotate(prev));
}

    // Tlacitka kalkulačky:
  const onNumberPress = num => {
    if (!selectedPreset) return;
     const add = selectedPreset.multiplier != null
    ? num * selectedPreset.multiplier
    : num;
  setInputTotal(prev => prev + add);
};
  const onClear = () => setInputTotal(0);
  const onOk    = () => {
  submitThrow(inputTotal);
  setInputTotal(0);
};
  // --- Render ---
  const topCards = order.slice(0, 4);
  const overflow = order.slice(4);

return (
  <View style={styles.wrapper}>
    {/* ─── Horní část: karty hráčů ─── */}
    <View style={[styles.topHalf]}>
      <View style={styles.grid}>
        {topCards.map((name, i) => (
          <View
            key={i}
            style={[styles.card, i === 0 && styles.activeCard,
            cardStyleOverride]}
          >
            <Text style={styles.cardName}>{name}</Text>
            <Text style={styles.cardScore}>{scores[i][currentLeg]}</Text>
            <Text style={styles.cardSub}>Legs {legWins[i]}/{legs}</Text>
            <Text style={styles.cardSub}>Sets {setWins[i]}/{sets}</Text>
            <Text style={styles.cardSub}>Darts {rounds[i]*3}</Text>
            <Text style={styles.cardSub}>
              Avg {rounds[i] ? (pointsScored[i]/rounds[i]).toFixed(2) : 0}
            </Text>
          </View>
        ))}
      </View>
      {overflow.length > 0 && (
        <ScrollView
          horizontal
          style={styles.overflow}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {overflow.map((name, idx) => (
            <View key={idx+4} style={styles.overflowItem}>
              <Text style={styles.cardName}>{name}</Text>
              <Text style={styles.cardScore}>
                {scores[idx+4][currentLeg]}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>

        {/* ─── Dolní část: presety + kalkulační řádek + pad/grid ─── */}
<View style={[styles.bottomHalf]}>

  {/* 1) Presety */}
  <View style={styles.presetsRow}>
    {PRESETS.map(p => (
      <TouchableOpacity
        key={p.label}
        style={[
          styles.presetBtn,
          selectedPreset === p && styles.presetBtnActive
        ]}
        onPress={() =>
          setSelectedPreset(selectedPreset === p ? null : p)
        }
      >
        <Text style={styles.presetText}>{p.label}</Text>
      </TouchableOpacity>
    ))}
  </View>

  {/* 2) Kalkulační řádek */}
  <View style={styles.calcRow}>
   <TouchableOpacity
    style={styles.clearBtn}
    onPress={() => setInputTotal(prev => prev + 25)}
  >
    <Text style={styles.actionText}>Outer</Text>
  </TouchableOpacity>
    <Text style={styles.calcDisplay}>{inputTotal}</Text>
     <TouchableOpacity
    style={styles.okBtn}
    onPress={() => setInputTotal(prev => prev + 50)}
  >
    <Text style={styles.actionText}>Bull</Text>
  </TouchableOpacity>
</View>

  {/* 3) Pokud preset.label === 'N', ukázat manual pad, jinak 4×5 grid */}
  {selectedPreset && selectedPreset.label === 'N' ? (
    // MANUÁLNÍ PAD 3×4
    <View style={styles.manualPad}>
      {KEYS_MANUAL.map(row => (
        <View key={row.join()} style={styles.manualRow}>
          {row.map(key => (
            <TouchableOpacity
              key={key}
              style={[
                styles.manualKey,
                key === 'OK' && styles.keyOK,
                key === '⌫' && styles.keyDel,
              ]}
              onPress={() => {
                if (key === 'OK') onOk();
                else if (key === '⌫') onClear();
                else setInputTotal(prev => prev * 10 + Number(key));
              }}
            >
              <Text
                style={[
                  styles.manualKeyLabel,
                  key === 'OK' && styles.keyLabelOK
                ]}
              >
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>

  ) : (
    // 4×5 GRID ČÍSEL 1–20
    <View style={styles.numberGrid}>
      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
        <TouchableOpacity
          key={num}
          style={styles.numBtn}
          onPress={() => onNumberPress(num)}
        >
          <Text style={styles.numText}>{num}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}

</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:    { flex: 1, backgroundColor: '#2E4453' },
  topHalf:    { flex: 0.45, paddingVertical: 8 },
  bottomHalf: { flex: 0.5, paddingHorizontal: 12, justifyContent: 'flex-start' },

  /* Karty nahoře – necháváš beze změny */
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  card: { width: 150, backgroundColor: '#3B5770', padding: 6, margin: 10, borderRadius: 8, alignItems: 'center', height: 115,  },
  activeCard: { borderWidth: 2, borderColor: '#27AE60' },
  cardName: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  cardScore: { color: 'white', fontSize: 20, marginVertical: 4 },
  cardSub: { color: 'white', fontSize: 10 },
  overflow: { marginTop: 8 },
 overflowItem: {
  backgroundColor: '#405A72',
  padding: 8,
  marginRight: 8,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,        // fixní šířka
  height: 60,      // fixní výška
},

  presetsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between', // roztáhne tlačítka od okraje k okraji
  width: '105%',
  marginBottom: 4,
  paddingHorizontal: 0,           // vnitřní odsazení řádku (volitelné)
  marginLeft: -7,
},
presetBtn: {
  flex: 1,                          // tlačítko se roztáhne na rovnou část řádku
  marginHorizontal: 4,              // mezery mezi tlačítky
  backgroundColor: '#27AE60',
  paddingVertical: 6,
  borderRadius: 6,
  alignItems: 'center',             // zarovnat text na střed
},
presetBtnActive: {
  borderWidth: 2,
  borderColor: 'white',
},
presetText: {
  color: 'white',
  fontSize: 16,
  fontWeight: 'bold',
},

  /* 4×5 tabulka čísel 1–20 */
  numberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numBtn: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#405A72',
    marginVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  /* Řádek kalkulačky (C | součet | OK) */
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  clearBtn: {
    backgroundColor: '#E74C3C',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  okBtn: {
    backgroundColor: '#27AE60',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  calcDisplay: {
    flex: 1,
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
 /* 3×4 manuální pad */
  manualPad: {
    flex: 1,                   // pad vyplní zbývající prostor
    justifyContent: 'top',  // vertikálně ve středu
    alignItems: 'center',      // horizontálně ve středu
    paddingHorizontal: 8,
  },
  manualRow: {
    flexDirection: 'row',
    width: '100%',             // roztáhne řádek na celou šířku
    justifyContent: 'space-between', // buňky po celé šířce
    marginVertical: 2,
  },
  manualKey: {
    flex: 1,                   // každá buňka roste stejně
    aspectRatio: 1.4,            // čtverec
    marginHorizontal: 3,
    backgroundColor: '#405A72',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  manualKeyLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
