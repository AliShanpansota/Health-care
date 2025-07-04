// utils/storage.js

import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (e) {
    console.error("Error saving token:", e);
  }
};

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token;
  } catch (e) {
    console.error("Error getting token:", e);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
  } catch (e) {
    console.error("Error removing token:", e);
  }
};