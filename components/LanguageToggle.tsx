import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLanguage } from './LanguageProvider';

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  const getFlag = (lang: string) => {
    return lang === 'es' ? '🇪🇸' : '🇺🇸';
  };

  const getLanguageCode = (lang: string) => {
    return lang === 'es' ? 'ES' : 'EN';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{getFlag(currentLanguage)}</Text>
      <Text style={styles.languageCode}>{getLanguageCode(currentLanguage)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 70,
    justifyContent: 'center',
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CCCCCC',
  },
});