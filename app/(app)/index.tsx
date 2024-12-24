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
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          // Check if we've reached target duration
          if (newTime >= targetHours * 3600) {
            clearInterval(timerRef.current);
            setIsFasting(false);
            return prev;
          }
          return newTime;
        });
      }, 1000);

      // Start wave animation
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

    // Cleanup function
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
    // Clear existing timer if any
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
    const hours = parseInt(customHours);
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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const targetSeconds = targetHours * 3600;
    return Math.min((timeElapsed / targetSeconds) * 100, 100);
  };

  const MenuItem = ({ icon, label }) => (
    <Pressable style={styles.menuItem}>
      <MaterialCommunityIcons name={icon} size={24} color="#E5E7EB" />
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );

  const DurationModal = () => (
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
  );

  const MetabolicStateIndicator = () => (
    <View style={styles.metabolicStateContainer}>
      <View style={[styles.currentStateIndicator, { backgroundColor: currentMetabolicState.color }]}>
        <Text style={styles.metabolicStateText}>{currentMetabolicState.name}</Text>
      </View>
      <Text style={styles.nextStateText}>
        {`Next: ${nextMetabolicState.name} in ${formatTime(timeToNextState)}`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <DurationModal />

      {/* Sliding Menu */}
      <Animated.View style={[
        styles.menu,
        { transform: [{ translateX: menuSlide }] }
      ]}>
        <View style={styles.menuHeader}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <MaterialCommunityIcons name="account" size={40} color="#E5E7EB" />
            </View>
            <View>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john@example.com</Text>
            </View>
          </View>
        </View>
        
        <ScrollView style={styles.menuItems}>
          <MenuItem icon="account" label="Profile" />
          <MenuItem icon="cog" label="Settings" />
          <MenuItem icon="history" label="Fasting Logs" />
          <MenuItem icon="chart-bar" label="Statistics" />
          <MenuItem icon="bell" label="Notifications" />
          <MenuItem icon="information" label="About" />
          <MenuItem icon="help-circle" label="Help & Support" />
          
          <View style={styles.menuDivider} />
          
          <Text style={styles.menuSectionTitle}>Fast Details</Text>
          <View style={styles.fastDetails}>
            <Text style={styles.fastDetailText}>Current Fast: {targetHours}:0 hrs</Text>
            <Text style={styles.fastDetailText}>Total Fasts: 24</Text>
            <Text style={styles.fastDetailText}>Avg. Duration: 16.5 hrs</Text>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Main Content */}
      <Animated.View style={[
        styles.mainContent,
        { transform: [{ translateX: mainViewSlide }] }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={toggleMenu}>
            <MaterialCommunityIcons name="menu" size={24} color="#9CA3AF" />
          </Pressable>
          <Text style={styles.headerTitle}>Fasting Timer</Text>
          <MaterialCommunityIcons name="bell" size={24} color="#9CA3AF" />
        </View>

        {/* Main Timer Display */}
        <View style={styles.timerContainer}>
          <Animated.View style={[
            styles.timerContent,
            { 
              transform: [{ translateY }],
              opacity: fadeAnim 
            }
          ]}>
            <Text style={styles.timerText}>
              {formatTime(timeElapsed)}
            </Text>
            <Text style={styles.targetDurationText}>
              Target: {targetHours} hours
            </Text>
            <Text style={styles.statusText}>
              {isFasting ? 'Fasting in progress' : 'Select duration to start'}
            </Text>
            
            {isFasting && <MetabolicStateIndicator />}
            
            {/* Progress Circle */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground} />
              <View style={[
                styles.progressForeground,
                {
                  transform: [{ rotate: `${getProgress() * 3.6}deg` }]
                }
              ]} />
              <Text style={styles.progressText}>
                {`${Math.round(getProgress())}%`}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomContainer}>
          {!isFasting ? (
            <Pressable
              style={styles.mainButton}
              onPress={() => setIsDurationModalVisible(true)}
            >
              <Text style={styles.buttonText}>Select Duration</Text>
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
    </View>
  );
};

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
  },
  menuHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#111827',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#374151',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    color: '#9CA3AF',
    fontSize: 14,
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
  menuDivider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 20,
  },
  menuSectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  fastDetails: {
    backgroundColor: '#374151',
    padding: 15,
    borderRadius: 10,
  },
  fastDetailText: {
    color: '#E5E7EB',
    fontSize: 14,
    marginBottom: 5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#111827',
  },
 header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        color: '#E5E7EB',
        fontSize: 18,
        fontWeight: '600',
    },
    timerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContent: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    targetDurationText: {
        color: '#9CA3AF',
        fontSize: 16,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 18,
        color: '#9CA3AF',
    },
    progressContainer: {
        marginTop: 32,
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
        transform: [{ rotateZ: '-90deg' }],
    },
    progressText: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    bottomContainer: {
        paddingBottom: 48,
        paddingHorizontal: 24,
    },
    mainButton: {
        padding: 16,
        borderRadius: 999,
        backgroundColor: '#3B82F6',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 4,
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
        fontWeight: '500',
    },
    customDurationContainer: {
        marginTop: 20,
        marginBottom: 10,
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
        marginTop: 20,
        padding: 16,
        backgroundColor: '#4B5563',
        borderRadius: 12,
    },
    closeModalButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
    },
    metabolicStateContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    currentStateIndicator: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    metabolicStateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    nextStateText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
});

export default FastingTracker;