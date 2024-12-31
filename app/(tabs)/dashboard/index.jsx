import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';


const { width, height } = Dimensions.get('window');

// Metabolic state thresholds in hours
const METABOLIC_STATES = [
  { name: 'Fed State', startHour: 0, endHour: 4, color: '#4ADE80' },
  { name: 'Catabolic State', startHour: 4, endHour: 12, color: '#60A5FA' },
  { name: 'Ketosis', startHour: 12, endHour: 18, color: '#818CF8' },
  { name: 'Deep Ketosis', startHour: 18, endHour: 24, color: '#A78BFA' },
  { name: 'Autophagy', startHour: 24, endHour: 72, color: '#F472B6' },
  { name: 'Deep Autophagy', startHour: 72, endHour: 168, color: '#FB7185' },
];

const PRESET_DURATIONS = [
  { label: '16:8 Fast', hours: 16 },
  { label: '18:6 Fast', hours: 18 },
  { label: '20:4 Fast', hours: 20 },
  { label: 'OMAD (23:1)', hours: 23 },
  { label: '36 Hour Fast', hours: 36 },
  { label: '48 Hour Fast', hours: 48 },
  { label: '72 Hour Fast', hours: 72 },
  { label: '1 Week Fast', hours: 168 },
];

const FastingTracker = () => {
  const [isFasting, setIsFasting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targetHours, setTargetHours] = useState(16);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDurationModalVisible, setIsDurationModalVisible] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [currentMetabolicState, setCurrentMetabolicState] = useState(METABOLIC_STATES[0]);
  const [nextMetabolicState, setNextMetabolicState] = useState(METABOLIC_STATES[1]);
  const [timeToNextState, setTimeToNextState] = useState(0);

  const router = useRouter();


  const fadeAnim = new Animated.Value(1);
  const translateY = new Animated.Value(0);
  const menuSlide = useRef(new Animated.Value(-width)).current;
  const mainViewSlide = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const toggleMenu = () => {
    const toValue = isMenuOpen ? -width : 0;
    const mainToValue = isMenuOpen ? 0 : width * 0.8;

    Animated.parallel([
      Animated.timing(menuSlide, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mainViewSlide, {
        toValue: mainToValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isFasting) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          if (newTime >= targetHours * 3600) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            setIsFasting(false);
            return prev;
          }
          return newTime;
        });
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isFasting, targetHours]);

  useEffect(() => {
    updateMetabolicState();
  }, [timeElapsed]);

  const updateMetabolicState = () => {
    const hoursElapsed = timeElapsed / 3600;

    let current = METABOLIC_STATES[0];
    let next = METABOLIC_STATES[1];

    for (let i = 0; i < METABOLIC_STATES.length; i++) {
      const state = METABOLIC_STATES[i];
      if (hoursElapsed >= state.startHour && hoursElapsed < state.endHour) {
        current = state;
        next = METABOLIC_STATES[i + 1] || state;
        break;
      }
    }

    setCurrentMetabolicState(current);
    setNextMetabolicState(next);
    setTimeToNextState(next.startHour * 3600 - timeElapsed);
  };

  const startFastWithDuration = (hours) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTargetHours(hours);
    setTimeElapsed(0);
    setIsFasting(true);
    setIsDurationModalVisible(false);
  };

  const stopFasting = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsFasting(false);
    setTimeElapsed(0);
  };

  const handleCustomDuration = () => {
    const hours = parseInt(customHours, 10);
    if (hours >= 16 && hours <= 168) {
      startFastWithDuration(hours);
    } else {
      alert('Please enter a duration between 16 hours and 1 week (168 hours)');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const targetSeconds = targetHours * 3600;
    return Math.min((timeElapsed / targetSeconds) * 100, 100);
  };

  const MenuItem = ({ icon, label, route }) => (
    <Pressable 
      style={styles.menuItem}
      onPress={() => {
        router.push(route);
        toggleMenu(); // Close menu after navigation
      }}
    >
      <MaterialCommunityIcons name={icon} size={24} color="#E5E7EB" />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Sliding Menu */}
      <Animated.View style={[
        styles.menu,
        { transform: [{ translateX: menuSlide }] }
      ]}>
        
        {/* Menu Content */}
        <View style={styles.menuHeader}>
          <View style={styles.profileSection}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#E5E7EB" />
            <View>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john@example.com</Text>
            </View>
          </View>
        </View>
        
        {/* Menu Items */}
        <ScrollView style={styles.menuItems}>
          <MenuItem 
            icon="account" 
            label="Profile" 
            route="/(tabs)/dashboard/profile" 
          />
          <MenuItem 
            icon="cog" 
            label="Settings" 
            route="/(tabs)/dashboard/settings" 
          />
          <MenuItem 
            icon="history" 
            label="History" 
            route="/(tabs)/dashboard/history" 
          />
          <MenuItem 
            icon="chart-bar" 
            label="Statistics" 
            route="/(tabs)/dashboard/statistics" 
          />
        </ScrollView>
      </Animated.View>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, { transform: [{ translateX: mainViewSlide }] }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={toggleMenu}>
            <MaterialCommunityIcons name="menu" size={24} color="#9CA3AF" />
          </Pressable>
          <Text style={styles.headerTitle}>Fasting Timer</Text>
          <MaterialCommunityIcons name="bell" size={24} color="#9CA3AF" />
        </View>

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timeElapsed)}</Text>
          <Text style={styles.targetDurationText}>Target: {targetHours} hours</Text>
          
          {isFasting && (
            <View style={styles.metabolicStateContainer}>
              <View style={[styles.stateIndicator, { backgroundColor: currentMetabolicState.color }]}>
                <Text style={styles.stateText}>{currentMetabolicState.name}</Text>
              </View>
              <Text style={styles.nextStateText}>
                Next: {nextMetabolicState.name} in {formatTime(timeToNextState)}
              </Text>
            </View>
          )}
          
          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <View style={[
              styles.progressForeground,
              {
                transform: [{ rotate: `${getProgress() * 3.6}deg` }]
              }
            ]} />
            <Text style={styles.progressText}>{Math.round(getProgress())}%</Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {!isFasting ? (
            <Pressable
              style={styles.mainButton}
              onPress={() => setIsDurationModalVisible(true)}
            >
              <Text style={styles.buttonText}>Start Fast</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.mainButton, { backgroundColor: '#EF4444' }]}
              onPress={stopFasting}
            >
              <Text style={styles.buttonText}>End Fast</Text>
            </Pressable>
          )}
          
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>5 days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Longest Fast</Text>
              <Text style={styles.statValue}>18h 30m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Week Goal</Text>
              <Text style={styles.statValue}>4/7</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Duration Selection Modal */}
      <Modal
        visible={isDurationModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Fasting Duration</Text>
            <ScrollView style={styles.presetContainer}>
              {PRESET_DURATIONS.map((duration, index) => (
                <Pressable
                  key={index}
                  style={styles.presetButton}
                  onPress={() => startFastWithDuration(duration.hours)}
                >
                  <Text style={styles.presetButtonText}>{duration.label}</Text>
                </Pressable>
              ))}
              
              <View style={styles.customDurationContainer}>
                <Text style={styles.customDurationLabel}>Custom Duration (hours)</Text>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customDurationInput}
                    keyboardType="numeric"
                    value={customHours}
                    onChangeText={setCustomHours}
                    placeholder="16-168"
                    placeholderTextColor="#9CA3AF"
                  />
                  <Pressable
                    style={styles.customDurationButton}
                    onPress={handleCustomDuration}
                  >
                    <Text style={styles.customDurationButtonText}>Set</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
            
            <Pressable
              style={styles.closeModalButton}
              onPress={() => setIsDurationModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#1F2937',
    zIndex: 2,
    paddingTop: 50,
  },
  menuHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  profileEmail: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 12,
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#E5E7EB',
    fontSize: 16,
    marginLeft: 15,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  targetDurationText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  metabolicStateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stateIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  stateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  nextStateText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  progressContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 2,
    borderColor: '#374151',
  },
  progressForeground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  progressText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  mainButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  presetContainer: {
    maxHeight: height * 0.5,
  },
  presetButton: {
    backgroundColor: '#374151',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  presetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  customDurationContainer: {
    marginTop: 20,
  },
  customDurationLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customDurationInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    marginRight: 10,
  },
  customDurationButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    width: 80,
  },
  customDurationButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  closeModalButton: {
    backgroundColor: '#4B5563',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default FastingTracker;