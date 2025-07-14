import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  X, 
  Check, 
  Clock, 
  Package, 
  CreditCard, 
  Zap, 
  Star,
  Trash2,
  Settings
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { notificationService } from '@/services/notificationService';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'delivery' | 'subscription' | 'payment' | 'reminder' | 'system';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

export default function NotificationCenter({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onDeleteNotification
}: NotificationCenterProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showSettings, setShowSettings] = useState(false);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'delivery':
        return <Package size={20} color="#4CAF50" />;
      case 'subscription':
        return <Zap size={20} color="#D4AF37" />;
      case 'payment':
        return <CreditCard size={20} color="#2196F3" />;
      case 'reminder':
        return <Clock size={20} color="#FF9800" />;
      case 'system':
        return <Star size={20} color="#9C27B0" />;
      default:
        return <Bell size={20} color="#666666" />;
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'delivery': return '#4CAF50';
      case 'subscription': return '#D4AF37';
      case 'payment': return '#2196F3';
      case 'reminder': return '#FF9800';
      case 'system': return '#9C27B0';
      default: return '#666666';
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Deseas marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar todas',
          onPress: () => {
            notifications.forEach(notification => {
              if (!notification.read) {
                onMarkAsRead(notification.id);
              }
            });
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Eliminar todas las notificaciones',
      '¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todas',
          style: 'destructive',
          onPress: () => {
            notifications.forEach(notification => {
              onDeleteNotification(notification.id);
            });
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    
    // Aquí podrías navegar a la pantalla correspondiente según el tipo de notificación
    switch (notification.type) {
      case 'delivery':
        // Navegar a pantalla de entregas
        break;
      case 'subscription':
        // Navegar a pantalla de automatizaciones
        break;
      case 'payment':
        // Navegar a pantalla de wallet
        break;
      default:
        break;
    }
  };

  const renderNotificationItem = (notification: Notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(notification)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          {getNotificationIcon(notification.type)}
        </View>
        <View style={styles.notificationInfo}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationTime}>
            {formatTimeAgo(notification.createdAt)}
          </Text>
        </View>
        <View style={styles.notificationActions}>
          {!notification.read && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onMarkAsRead(notification.id)}
            >
              <Check size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDeleteNotification(notification.id)}
          >
            <Trash2 size={16} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.notificationBody}>{notification.body}</Text>
      {!notification.read && (
        <View style={[
          styles.unreadIndicator,
          { backgroundColor: getNotificationColor(notification.type) }
        ]} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#000000', '#1a1a1a']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Bell size={24} color="#D4AF37" />
              <Text style={styles.headerTitle}>Notificaciones</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setShowSettings(true)}
              >
                <Settings size={20} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onClose}
              >
                <X size={20} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Filters */}
        <View style={styles.filters}>
          {[
            { key: 'all', label: 'Todas' },
            { key: 'unread', label: 'No leídas' },
            { key: 'read', label: 'Leídas' }
          ].map((filterOption) => (
            <TouchableOpacity
              key={filterOption.key}
              style={[
                styles.filterButton,
                filter === filterOption.key && styles.filterButtonActive
              ]}
              onPress={() => setFilter(filterOption.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === filterOption.key && styles.filterButtonTextActive
              ]}>
                {filterOption.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        {filteredNotifications.length > 0 && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllAsRead}
            >
              <Check size={16} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Marcar todas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteAll}
            >
              <Trash2 size={16} color="#F44336" />
              <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
                Eliminar todas
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notifications List */}
        <ScrollView 
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={64} color="#666666" />
              <Text style={styles.emptyStateTitle}>
                {filter === 'all' ? 'No hay notificaciones' : 
                 filter === 'unread' ? 'No hay notificaciones sin leer' : 
                 'No hay notificaciones leídas'}
              </Text>
              <Text style={styles.emptyStateDescription}>
                {filter === 'all' ? 'Las notificaciones aparecerán aquí cuando tengas actualizaciones' :
                 filter === 'unread' ? 'Todas las notificaciones han sido leídas' :
                 'No hay notificaciones leídas para mostrar'}
              </Text>
            </View>
          ) : (
            filteredNotifications.map(renderNotificationItem)
          )}
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.settingsContainer}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Configuración de Notificaciones</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={20} color="#D4AF37" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.settingsContent}>
              <Text style={styles.settingsDescription}>
                Configura qué tipos de notificaciones quieres recibir
              </Text>
              {/* Aquí irían las opciones de configuración */}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#D4AF37',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsContent: {
    flex: 1,
    padding: 20,
  },
  settingsDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 20,
  },
}); 