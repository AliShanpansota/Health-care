import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const API_URL = 'https://67301b7b-c2a6-4c33-8f50-a015797582cf-00-3vamp1rne494a.pike.replit.dev/api/auth';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState('doctor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [healthData, setHealthData] = useState('');

  const handleRegister = async () => {
    try {
      let registrationData = {
        name,
        email,
        password,
      };

      if (role === 'doctor') {
        registrationData.specialty = specialty;
      } else {
        registrationData.doctorCode = doctorCode;
      }

      const response = await axios.post(
        `${API_URL}/register/${role}`,
        registrationData
      );

      Alert.alert(
        'Success',
        `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`,
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Register as {role}</Text>

        {/* Role Selection */}
        <Text style={styles.label}>Select Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
            dropdownIconColor="white"
          >
            <Picker.Item label="Doctor" value="doctor" />
            <Picker.Item label="Patient" value="patient" />
          </Picker>
        </View>

        {/* Name Input */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
        />

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password Input */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Specialty Input for Doctors */}
        {role === 'doctor' && (
          <>
            <Text style={styles.label}>Specialty</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter specialty"
              placeholderTextColor="#aaa"
              value={specialty}
              onChangeText={setSpecialty}
            />
          </>
        )}

        {/* Doctor Code and Health Data for Patients */}
        {role === 'patient' && (
          <>
            <Text style={styles.label}>Doctor Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter doctor code"
              placeholderTextColor="#aaa"
              value={doctorCode}
              onChangeText={setDoctorCode}
            />

            <Text style={styles.label}>Health Data</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter health info"
              placeholderTextColor="#aaa"
              value={healthData}
              onChangeText={setHealthData}
            />
          </>
        )}

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f0f0f', // Dark background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a1a', // Slightly lighter than the background
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Montserrat_Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Montserrat_Regular',
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 15,
  },
  picker: {
    color: '#fff',
    height: 50,
    width: '100%',
  },
  registerButton: {
    backgroundColor: '#F2994A', // Accent color
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  registerButtonText: {
    color: '#121212',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Montserrat_Bold',
  },
  loginLink: {
    color: '#F2994A', // Accent color
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Montserrat_Regular',
  },
});

export default RegisterScreen;