import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react-native';
import { getShopifyStoreStats, invalidateShopifyCache } from '@/data/shopifyData';

interface ShopifyIntegrationStatusProps {
  onRefresh?: () => void;
}

export default function ShopifyIntegrationStatus({ onRefresh }: ShopifyIntegrationStatusProps) {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [stats, setStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkShopifyConnection();
  }, []);

  const checkShopifyConnection = async () => {
    try {
      setStatus('loading');
      const shopifyStats = await getShopifyStoreStats();
      setStats(shopifyStats);
      setStatus('connected');
    } catch (error) {
      console.error('Error checking Shopify connection:', error);
      setStatus('error');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      invalidateShopifyCache();
      await checkShopifyConnection();
      onRefresh?.();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={16} color="#10B981" strokeWidth={2} />;
      case 'error':
        return <AlertCircle size={16} color="#EF4444" strokeWidth={2} />;
      default:
        return <RefreshCw size={16} color="#D4AF37" strokeWidth={2} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Conectado a Shopify';
      case 'error':
        return 'Error de conexión';
      default:
        return 'Verificando conexión...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#10B981';
      case 'error':
        return '#EF4444';
      default:
        return '#D4AF37';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {status === 'connected' && (
            <View style={styles.liveBadge}>
              <Zap size={12} color="#10B981" strokeWidth={2} />
              <Text style={styles.liveText}>En vivo</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw 
            size={16} 
            color="#D4AF37" 
            strokeWidth={2}
            style={[isRefreshing && styles.spinning]}
          />
        </TouchableOpacity>
      </View>

      {status === 'connected' && stats && (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.inStockProducts}</Text>
            <Text style={styles.statLabel}>En Stock</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{stats.formattedAveragePrice}</Text>
            <Text style={styles.statLabel}>Precio Prom.</Text>
          </View>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudo conectar con Shopify. Usando datos locales.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  liveText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 2,
  },
  refreshButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  spinning: {
    transform: [{ rotate: '360deg' }],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});