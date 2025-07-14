import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Bell, Package, Zap, CreditCard, Clock, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const NOTIFICATION_TYPES = [
  { type: 'delivery', label: 'Entregas', icon: <Package size={20} color="#4CAF50" />, desc: 'Actualizaciones sobre el estado de tus entregas.' },
  { type: 'subscription', label: 'Suscripciones', icon: <Zap size={20} color="#D4AF37" />, desc: 'Recordatorios y cambios en tus suscripciones.' },
  { type: 'payment', label: 'Pagos', icon: <CreditCard size={20} color="#2196F3" />, desc: 'Confirmaciones y alertas de pago.' },
  { type: 'reminder', label: 'Recordatorios', icon: <Clock size={20} color="#FF9800" />, desc: 'Recordatorios personalizados y avisos.' },
  { type: 'system', label: 'Sistema', icon: <Star size={20} color="#9C27B0" />, desc: 'Mensajes importantes de la app.' },
  { type: 'alert', label: 'Alertas Inteligentes', icon: <Bell size={20} color="#F44336" />, desc: 'Alertas de stock, precios, clima y más.' },
];

export default function NotificationsSettings() {
  const router = useRouter();
  const [prefs, setPrefs] = useState({
    delivery: true,
    subscription: true,
    payment: true,
    reminder: true,
    system: true,
    alert: true,
  });

  const handleToggle = (type: string) => {
    setPrefs(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Bell size={24} color="#D4AF37" />
        <Text style={styles.headerTitle}>Configuración de Notificaciones</Text>
        <View style={{ flex: 1 }} />
      </View>
      <ScrollView style={styles.list}>
        {NOTIFICATION_TYPES.map(nt => (
          <View key={nt.type} style={styles.card}>
            <View style={styles.cardHeader}>
              {nt.icon}
              <Text style={styles.cardTitle}>{nt.label}</Text>
              <View style={{ flex: 1 }} />
              <Switch
                value={prefs[nt.type as keyof typeof prefs]}
                onValueChange={() => handleToggle(nt.type)}
                trackColor={{ false: '#333', true: '#D4AF37' }}
                thumbColor={prefs[nt.type as keyof typeof prefs] ? '#000' : '#ccc'}
                style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
              />
            </View>
            <Text style={styles.cardDesc}>{nt.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#18181a' },
  headerBack: { marginRight: 12 },
  headerBackText: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
  list: { flex: 1, padding: 16 },
  card: { backgroundColor: '#18181a', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  cardDesc: { color: '#aaa', fontSize: 13, marginLeft: 30 },
}); 