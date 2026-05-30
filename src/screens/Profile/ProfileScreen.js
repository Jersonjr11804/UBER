import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { setUserProfile, updateLanguage } from '../../redux/slices/userSlice';
import { logout } from '../../redux/slices/authSlice';
import { updateUserProfile, logoutUser } from '../../services/firebase';

const GENDER_OPTIONS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
const LANGUAGE_OPTIONS = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const auth = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    gender: user.gender || '',
    email: user.email || '',
    language: user.language || 'es',
    photo: user.photo || null,
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (!response.didCancel && response.assets?.[0]?.uri) {
        updateField('photo', response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.email) {
      Alert.alert('Error', 'Los campos no pueden estar vacíos');
      return;
    }
    if (form.fullName.length > 50) {
      Alert.alert('Error', 'El nombre no puede superar 50 caracteres');
      return;
    }
    if (!validateEmail(form.email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(auth.user.uid, form);
      dispatch(setUserProfile(form));
      dispatch(updateLanguage(form.language));
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const renderPersonalTab = () => (
    <View>
      {/* Foto de perfil */}
      <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
        {form.photo ? (
          <Image source={{ uri: form.photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>
              {form.fullName ? form.fullName[0].toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <Text style={styles.photoLabel}>Cambiar foto</Text>
      </TouchableOpacity>

      {/* Nombre */}
      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={form.fullName}
        onChangeText={(v) => updateField('fullName', v)}
        maxLength={50}
        placeholder="Tu nombre"
        placeholderTextColor="#666"
      />

      {/* Teléfono */}
      <Text style={styles.label}>Número de celular</Text>
      <TextInput
        style={styles.input}
        value={form.phone}
        onChangeText={(v) => updateField('phone', v)}
        keyboardType="phone-pad"
        placeholder="Tu número"
        placeholderTextColor="#666"
      />

      {/* Género */}
      <Text style={styles.label}>Género</Text>
      <View style={styles.optionsRow}>
        {GENDER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionChip,
              form.gender === option && styles.optionChipActive,
            ]}
            onPress={() => updateField('gender', option)}>
            <Text
              style={[
                styles.optionChipText,
                form.gender === option && styles.optionChipTextActive,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Correo */}
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={styles.input}
        value={form.email}
        onChangeText={(v) => updateField('email', v)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="Tu correo"
        placeholderTextColor="#666"
      />
    </View>
  );

  const renderSettingsTab = () => (
    <View>
      {/* Idioma */}
      <Text style={styles.label}>Idioma</Text>
      <View style={styles.optionsRow}>
        {LANGUAGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionChip,
              form.language === option.value && styles.optionChipActive,
            ]}
            onPress={() => updateField('language', option.value)}>
            <Text
              style={[
                styles.optionChipText,
                form.language === option.value && styles.optionChipTextActive,
              ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <Text style={styles.title}>Mi perfil</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'personal' && styles.tabActive]}
          onPress={() => setActiveTab('personal')}>
          <Text style={[styles.tabText, activeTab === 'personal' && styles.tabTextActive]}>
            Datos personales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}>
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Configuración
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'personal' ? renderPersonalTab() : renderSettingsTab()}

      {/* Botón guardar */}
      {activeTab === 'personal' && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  photoLabel: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  label: {
    color: '#999999',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
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
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#1A1A1A',
  },
  optionChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  optionChipText: {
    color: '#666666',
    fontSize: 13,
  },
  optionChipTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;