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

  const MenuItem = ({ icon, label }) => (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuItemText}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Main UI logic here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
});

export default FastingTracker;
