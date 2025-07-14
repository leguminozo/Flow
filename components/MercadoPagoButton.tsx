import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';

const MercadoPagoButton = () => {
  const handlePress = async () => {
    const url = 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=2c93808497f5faa70197fc1f9cde0294';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error("Don't know how to open this URL: " + url);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handlePress}
    >
      <Text style={styles.buttonText}>Suscribirme</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#3483FA',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Arial',
  },
});

export default MercadoPagoButton; 