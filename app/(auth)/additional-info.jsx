import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";

const AdditionalInfoScreen = () => {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("lb");
  const [heightUnit, setHeightUnit] = useState("inch");
  const [goal, setGoal] = useState("");

  const handleSubmit = async () => {
    if (!goal.trim()) {
      Alert.alert("Error", "Please enter your fasting goal.");
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}/additional-info`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            weight: weight.trim() + " " + weightUnit,
            height: height.trim() + " " + heightUnit,
            goal,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/dashboard") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message || "An error occurred.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Complete Your Profile</Text>

        {/* Weight & Unit together */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Weight & Unit</Text>
          <View style={styles.row}>
            {/* Weight Input */}
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Enter your weight"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            {/* Weight Unit Picker */}
            <View style={[styles.pickerWrapper, styles.pickerFlex]}>
              <Picker
                selectedValue={weightUnit}
                onValueChange={(itemValue) => setWeightUnit(itemValue)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="lb" value="lb" />
                <Picker.Item label="kg" value="kg" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Height & Unit together */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Height & Unit</Text>
          <View style={styles.row}>
            {/* Height Input */}
            <TextInput
              style={[styles.input, styles.inputFlex]}
              placeholder="Enter your height"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />

            {/* Height Unit Picker */}
            <View style={[styles.pickerWrapper, styles.pickerFlex]}>
              <Picker
                selectedValue={heightUnit}
                onValueChange={(itemValue) => setHeightUnit(itemValue)}
                style={styles.picker}
                dropdownIconColor="#FFFFFF"
              >
                <Picker.Item label="inch" value="inch" />
                <Picker.Item label="cm" value="cm" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Fasting Goal */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fasting Goal</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., weight loss, health, discipline"
            placeholderTextColor="#6B7280"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* Action Button */}
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111827",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#2D3748",
    color: "#FFFFFF",
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inputFlex: {
    flex: 3,
    marginRight: 8,
  },
  pickerWrapper: {
    backgroundColor: "#2D3748",
    borderRadius: 8,
  },
  pickerFlex: {
    flex: 2,
  },
  picker: {
    color: "#FFFFFF",
    width: "100%",
  },
  button: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdditionalInfoScreen;
