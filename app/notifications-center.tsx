import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Bell, Package, Zap, CreditCard, Clock, Star, Trash2, Check, Filter, Archive } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

const NOTIFICATION_TYPES = [
  { type: 'delivery', label: 'Entregas', icon: <Package size={20} color="#4CAF50" /> },
  { type: 'subscription', label: 'Suscripciones', icon: <Zap size={20} color="#D4AF37" /> },
  { type: 'payment', label: 'Pagos', icon: <CreditCard size={20} color="#2196F3" /> },
  { type: 'reminder', label: 'Recordatorios', icon: <Clock size={20} color="#FF9800" /> },
  { type: 'system', label: 'Sistema', icon: <Star size={20} color="#9C27B0" /> },
  { type: 'alert', label: 'Alertas Inteligentes', icon: <Bell size={20} color="#F44336" /> },
];

const mockNotifications = [
  { id: '1', type: 'delivery', title: 'Tu pedido está en camino', body: 'Llegará entre 10-12h', read: false, createdAt: '2024-07-12T10:00:00Z' },
  { id: '2', type: 'subscription', title: 'Próxima entrega de tu suscripción', body: 'El 15 de julio', read: false, createdAt: '2024-07-11T09:00:00Z' },
  { id: '3', type: 'payment', title: 'Pago procesado', body: 'Tu pago fue exitoso', read: true, createdAt: '2024-07-10T08:00:00Z' },
  { id: '4', type: 'reminder', title: 'Actualiza tu dirección', body: 'Para evitar problemas de entrega', read: true, createdAt: '2024-07-09T07:00:00Z' },
  { id: '5', type: 'system', title: 'Nueva versión disponible', body: 'Actualiza la app para nuevas funciones', read: false, createdAt: '2024-07-08T06:00:00Z' },
  { id: '6', type: 'alert', title: '¡Tu café favorito está por agotarse!', body: 'Quedan 2 unidades', read: false, createdAt: '2024-07-07T05:00:00Z' },
];

export default function NotificationsCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [archived, setArchived] = useState([]);
  const [filter, setFilter] = useState<'all' | string>('all');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  const handleArchive = (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      setArchived([...archived, notif]);
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };
  const handleUnarchive = (id: string) => {
    const notif = archived.find(n => n.id === id);
    if (notif) {
      setNotifications([notif, ...notifications]);
      setArchived(archived.filter(n => n.id !== id));
    }
  };

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const renderRightActions = (id: string) => (
    <TouchableOpacity style={styles.swipeActionArchive} onPress={() => handleArchive(id)}>
      <Archive size={20} color="#fff" />
      <Text style={styles.swipeActionText}>Archivar</Text>
    </TouchableOpacity>
  );
  const renderLeftActions = (id: string) => (
    <TouchableOpacity style={styles.swipeActionDelete} onPress={() => handleDelete(id)}>
      <Trash2 size={20} color="#fff" />
      <Text style={styles.swipeActionText}>Borrar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Text style={styles.headerBackText}>{'<'}</Text>
        </TouchableOpacity>
        <Bell size={24} color="#D4AF37" />
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ flex: 1 }} />
      </View>
      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]} onPress={() => setFilter('all')}>
          <Filter size={16} color={filter === 'all' ? '#000' : '#D4AF37'} />
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>
        {NOTIFICATION_TYPES.map(nt => (
          <TouchableOpacity key={nt.type} style={[styles.filterBtn, filter === nt.type && styles.filterBtnActive]} onPress={() => setFilter(nt.type)}>
            {nt.icon}
            <Text style={[styles.filterText, filter === nt.type && styles.filterTextActive]}>{nt.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Lista */}
      <ScrollView style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No hay notificaciones</Text>
        ) : (
          filtered.map(n => (
            <Swipeable
              key={n.id}
              renderRightActions={() => renderRightActions(n.id)}
              renderLeftActions={() => renderLeftActions(n.id)}
              overshootRight={false}
              overshootLeft={false}
            >
              <View style={[styles.card, !n.read && styles.cardUnread]}>
                <View style={styles.cardHeader}>
                  {NOTIFICATION_TYPES.find(nt => nt.type === n.type)?.icon}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{n.title}</Text>
                    <Text style={styles.cardDate}>{new Date(n.createdAt).toLocaleString()}</Text>
                  </View>
                  {!n.read && (
                    <TouchableOpacity onPress={() => handleMarkAsRead(n.id)} style={styles.actionBtn}>
                      <Check size={16} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(n.id)} style={styles.actionBtn}>
                    <Trash2 size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardBody}>{n.body}</Text>
              </View>
            </Swipeable>
          ))
        )}
        {/* Archivadas */}
        {archived.length > 0 && (
          <View style={styles.archivedSection}>
            <Text style={styles.archivedTitle}>Archivadas</Text>
            {archived.map(n => (
              <Swipeable
                key={n.id}
                renderRightActions={() => (
                  <TouchableOpacity style={styles.swipeActionDelete} onPress={() => handleDelete(n.id)}>
                    <Trash2 size={20} color="#fff" />
                    <Text style={styles.swipeActionText}>Borrar</Text>
                  </TouchableOpacity>
                )}
                renderLeftActions={() => (
                  <TouchableOpacity style={styles.swipeActionArchive} onPress={() => handleUnarchive(n.id)}>
                    <Archive size={20} color="#fff" />
                    <Text style={styles.swipeActionText}>Restaurar</Text>
                  </TouchableOpacity>
                )}
                overshootRight={false}
                overshootLeft={false}
              >
                <View style={[styles.card, styles.cardArchived]}>
                  <View style={styles.cardHeader}>
                    {NOTIFICATION_TYPES.find(nt => nt.type === n.type)?.icon}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{n.title}</Text>
                      <Text style={styles.cardDate}>{new Date(n.createdAt).toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(n.id)} style={styles.actionBtn}>
                      <Trash2 size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardBody}>{n.body}</Text>
                </View>
              </Swipeable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#222', backgroundColor: '#18181a', marginTop: 12 },
  headerBack: { marginRight: 12 },
  headerBackText: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginLeft: 12 },
  filters: { flexGrow: 0, flexShrink: 0, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#18181a', borderBottomWidth: 1, borderBottomColor: '#222' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  filterBtnActive: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  filterText: { color: '#D4AF37', marginLeft: 6, fontWeight: '500' },
  filterTextActive: { color: '#000' },
  list: { flex: 1, padding: 16 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#18181a', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222' },
  cardUnread: { borderColor: '#D4AF37' },
  cardArchived: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardInfo: { flex: 1, marginLeft: 10 },
  cardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardDate: { color: '#aaa', fontSize: 12, marginTop: 2 },
  cardBody: { color: '#ccc', fontSize: 14, marginTop: 4 },
  actionBtn: { marginLeft: 8 },
  swipeActionArchive: { backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', width: 90, height: '100%', flexDirection: 'column' },
  swipeActionDelete: { backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center', width: 90, height: '100%', flexDirection: 'column' },
  swipeActionText: { color: '#fff', fontWeight: 'bold', marginTop: 4 },
  archivedSection: { marginTop: 32 },
  archivedTitle: { color: '#aaa', fontWeight: 'bold', fontSize: 15, marginBottom: 12, marginLeft: 4 },
}); 