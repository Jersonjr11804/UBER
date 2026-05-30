import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import { setUserProfile } from '../../redux/slices/userSlice';
import { registerUser, saveUserProfile } from '../../services/firebase';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    const { fullName, phone, email, password, confirmPassword } = form;

    if (!fullName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (fullName.length > 50) {
      Alert.alert('Error', 'El nombre no puede superar 50 caracteres');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const user = await registerUser(email, password);
      const profileData = {
        fullName,
        phone,
        email,
        gender: '',
        photo: null,
        language: 'es',
      };
      await saveUserProfile(user.uid, profileData);
      dispatch(loginSuccess({ uid: user.uid, email: user.email }));
      dispatch(setUserProfile(profileData));
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Regístrate para empezar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#666"
        maxLength={50}
        value={form.fullName}
        onChangeText={(v) => updateField('fullName', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Número de celular"
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(v) => updateField('phone', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(v) => updateField('email', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => updateField('password', v)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor="#666"
        secureTextEntry
        value={form.confirmPassword}
        onChangeText={(v) => updateField('confirmPassword', v)}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Crear cuenta</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.loginLink}>Inicia sesión</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#666666',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;