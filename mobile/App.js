// My Pocket Tracker - React Native Mobile Application (Expo Entry point)
// Shared business logic integration with Web Dashboard

import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';

export default function App() {
  const [isPremium, setIsPremium] = useState(false);
  const [balance, setBalance] = useState(6380.00);
  const [income, setIncome] = useState(8700.00);
  const [expense, setExpense] = useState(2320.00);
  const [businesses, setBusinesses] = useState([
    { id: 'biz-1', name: 'Aether Software Studio', category: 'Technology' },
    { id: 'biz-2', name: 'Vanguard Cafe', category: 'Food & Beverage' }
  ]);
  const [currentBiz, setCurrentBiz] = useState(null); // null = Personal Finance

  const [txDesc, setTxDesc] = useState('');
  const [txAmt, setTxAmt] = useState('');

  const handleAddTransaction = () => {
    if (!txDesc || !txAmt) {
      Alert.alert('Error', 'Please enter transaction details');
      return;
    }
    const amt = parseFloat(txAmt);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid positive transaction amount');
      return;
    }

    setExpense(prev => prev + amt);
    setBalance(prev => prev - amt);
    setTxDesc('');
    setTxAmt('');
    Alert.alert('Success', 'Ledger transaction logged!');
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    Alert.alert('Premium Upgraded', 'Welcome to My Pocket Tracker Premium! Unlimited businesses unlocked.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.logoBadge}><Text style={styles.logoText}>M</Text></View>
            <Text style={styles.headerTitle}>My Pocket <Text style={styles.accentText}>Tracker</Text></Text>
          </View>
          <TouchableOpacity onPress={handleUpgrade} style={isPremium ? styles.premiumLabel : styles.upgradeBtn}>
            <Text style={styles.btnText}>{isPremium ? 'PRO MEMBER' : 'UPGRADE PRO'}</Text>
          </TouchableOpacity>
        </View>

        {/* Dashboard Switcher */}
        <View style={styles.switcherContainer}>
          <TouchableOpacity 
            onPress={() => setCurrentBiz(null)}
            style={[styles.switchTab, currentBiz === null && styles.activeSwitchTab]}
          >
            <Text style={[styles.switchText, currentBiz === null && styles.activeSwitchText]}>Home</Text>
          </TouchableOpacity>
          {businesses.map(biz => (
            <TouchableOpacity 
              key={biz.id}
              onPress={() => setCurrentBiz(biz)}
              style={[styles.switchTab, currentBiz?.id === biz.id && styles.activeSwitchTab]}
            >
              <Text style={[styles.switchText, currentBiz?.id === biz.id && styles.activeSwitchText]}>{biz.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet Metrics Card */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{currentBiz ? `${currentBiz.name} Balance` : 'Home Cashflow Net Worth'}</Text>
          <Text style={styles.metricValue}>${balance.toFixed(2)}</Text>

          <View style={styles.flowRow}>
            <View>
              <Text style={styles.flowLabel}>Income</Text>
              <Text style={styles.flowIncome}>+${income.toFixed(2)}</Text>
            </View>
            <View>
              <Text style={styles.flowLabel}>Expenses</Text>
              <Text style={styles.flowExpense}>-${expense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Add Transaction form block */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Quick Ledger Entry</Text>
          
          <TextInput 
            style={styles.input}
            placeholder="e.g. Office Supplies, Groceries"
            placeholderTextColor="#64748b"
            value={txDesc}
            onChangeText={setTxDesc}
          />
          <TextInput 
            style={styles.input}
            placeholder="Amount ($)"
            placeholderTextColor="#64748b"
            keyboardType="numeric"
            value={txAmt}
            onChangeText={setTxAmt}
          />

          <TouchableOpacity onPress={handleAddTransaction} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {/* Savings targets list */}
        {currentBiz === null && (
          <View style={styles.goalsContainer}>
            <Text style={styles.sectionTitle}>Savings Targets</Text>
            
            <View style={styles.goalCard}>
              <View style={{ flexDirection: 'row', justify: 'space-between', marginBottom: 6 }}>
                <Text style={styles.goalName}>Emergency Fund</Text>
                <Text style={styles.goalAmt}>$15,500 / $20,000</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '77%' }]} />
              </View>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    backgroundColor: '#10b981',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  accentText: {
    color: '#10b981',
  },
  upgradeBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  premiumLabel: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  switcherContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
    padding: 4,
    borderRadius: 10,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeSwitchTab: {
    backgroundColor: '#1a1a1a',
  },
  switchText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeSwitchText: {
    color: '#fff',
  },
  metricCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 20,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 20,
  },
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#222222',
    paddingTop: 15,
  },
  flowLabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 2,
  },
  flowIncome: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  flowExpense: {
    color: '#f43f5e',
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 20,
  },
  formTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  goalsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#222222',
  },
  goalName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  goalAmt: {
    color: '#94a3b8',
    fontSize: 11,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#000000',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
  }
});
