import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserProfile, logoutUser } from './api/api';

const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getUserProfile();
        setProfile(user);
        if (user.photoURL) {
          setImageUri(user.photoURL);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logoutUser(); // Your logout logic here
          navigation.replace('Login'); // Navigate to login screen
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      // You can also upload this to your backend or Firebase
    }
  };

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
        <Image
          source={{ uri: imageUri || defaultProfileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.changeText}>Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Welcome, {profile.name} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.label}>📛 Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>📧 Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>🆔 Role Code</Text>
        <Text style={styles.value}>
          {profile.doctorCode || profile.patientCode || 'N/A'}
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A1A1A',
    padding: 24,
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ccc',
  },
  profileImageWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: screenWidth * 0.35,
    height: screenWidth * 0.35,
    borderRadius: screenWidth * 0.35 / 2,
    borderWidth: 4,
    borderColor: '#00BFFF',
  },
  changeText: {
    marginTop: 8,
    color: '#00BFFF',
    fontSize: 14,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 24,
  },
  label: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: '#F1F1F1',
    fontSize: 18,
    marginBottom: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 16,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
