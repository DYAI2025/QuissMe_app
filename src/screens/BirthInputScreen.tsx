import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { theme } from '../utils/theme';
import { geocodeLocation } from '../utils/astroApi';

type BirthInputScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BirthInput'>;
};

export default function BirthInputScreen({ navigation }: BirthInputScreenProps) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setTime(selectedTime);
  };

  const handleContinue = async () => {
    if (!location.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Geburtsort ein');
      return;
    }

    setLoading(true);
    
    try {
      // Geocode location to get coordinates
      const coords = await geocodeLocation(location);
      
      navigation.navigate('AstroResult', { 
        birthData: { 
          date, 
          time, 
          location,
          lat: coords?.lat || 52.52,
          lon: coords?.lon || 13.405,
        } 
      });
    } catch (error) {
      Alert.alert(
        'Fehler', 
        'Ort konnte nicht gefunden werden. Standard-Koordinaten werden verwendet.'
      );
      navigation.navigate('AstroResult', { 
        birthData: { 
          date, 
          time, 
          location,
          lat: 52.52,
          lon: 13.405,
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🌙</Text>
          <Text style={styles.title}>Deine Geburtsdaten</Text>
          <Text style={styles.subtitle}>
            Für dein persönliches Astro-Profil benötigen wir einige Informationen.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Geburtsdatum</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.inputText}>
                {date.toLocaleDateString('de-DE')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Geburtszeit</Text>
            <TouchableOpacity 
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.inputText}>
                {time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Geburtsort</Text>
            <TextInput
              style={styles.textInput}
              placeholder="z.B. Berlin, Hamburg, München"
              placeholderTextColor={theme.colors.muted}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleContinue}
          disabled={!location.trim() || loading}
        >
          <LinearGradient
            colors={[theme.colors.indigo, theme.colors.violet]}
            style={[styles.button, (!location.trim() || loading) && styles.buttonDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Weiter ➝</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          🔒 Deine Daten werden sicher gespeichert und niemals ohne dein Einverständnis geteilt.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.colors.panel,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  inputText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    color: theme.colors.text,
    fontSize: 16,
  },
  button: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    marginTop: theme.spacing.lg,
    fontSize: 12,
    color: theme.colors.muted,
    textAlign: 'center',
  },
});
