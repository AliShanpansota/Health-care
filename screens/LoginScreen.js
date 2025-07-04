// screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from './api/api'; // Ensure the path is correct

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('doctor'); // or 'patient'


  const handleLogin = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  try {
    const response = await loginUser({ email, password, role });

    if (response?.token) {
      Alert.alert('Success', `${role.charAt(0).toUpperCase() + role.slice(1)} logged in`);

      navigation.navigate(role === 'doctor' ? 'DoctorHome' : 'PatientHome');
    } else {
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    }
  } catch (error) {
    console.error('Login Error:', error);
    const message = error?.response?.data?.message || 'Network error or server issue';
    Alert.alert('Login Error', message);
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Login</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, role === 'doctor' && styles.roleButtonActive]}
            onPress={() => setRole('doctor')}
          >
            <Text style={role === 'doctor' ? styles.roleTextActive : styles.roleText}>Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
            onPress={() => setRole('patient')}
          >
            <Text style={role === 'patient' ? styles.roleTextActive : styles.roleText}>Patient</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2D2D', // Dark background color
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#333', // Dark card background
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f1f1f1', // Light heading color
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#555', // Dark input fields
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#f1f1f1', // Light text color for inputs
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#666', // Grey buttons
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: '#ff7f50', // Highlight active role with coral color
  },
  roleText: {
    color: '#f1f1f1',
    fontWeight: '500',
  },
  roleTextActive: {
    color: '#fff', // White text when active
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#ff7f50', // Coral login button
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#ccc', // Light grey text for the "register" link
    fontSize: 14,
  },
});