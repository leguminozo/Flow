import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useBrandAssets } from '@/hooks/useBrandAssets';
import { RefreshCw } from 'lucide-react-native';

interface BrandAssetsDisplayProps {
  domain: string;
  showColors?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function BrandAssetsDisplay({ 
  domain, 
  showColors = false,
  size = 'medium' 
}: BrandAssetsDisplayProps) {
  const { brandAssets, loading, error, refreshAssets } = useBrandAssets(domain);

  const getLogoSize = () => {
    switch (size) {
      case 'small': return { width: 60, height: 60 };
      case 'large': return { width: 120, height: 120 };
      default: return { width: 80, height: 80 };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando información de marca...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error al cargar datos de marca</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshAssets}>
          <RefreshCw size={16} color="#D4AF37" strokeWidth={2} />
          <Text style={styles.refreshText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!brandAssets) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>No se encontraron datos de marca</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {brandAssets.logo_url && (
          <Image 
            source={{ uri: brandAssets.logo_url }} 
            style={[styles.logo, getLogoSize()]} 
          />
        )}
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{brandAssets.brand_name}</Text>
          <Text style={styles.domain}>{domain}</Text>
        </View>
      </View>

      {showColors && brandAssets.colors && (
        <View style={styles.colorsContainer}>
          <Text style={styles.colorsTitle}>Colores de marca:</Text>
          <View style={styles.colorPalette}>
            {Object.entries(brandAssets.colors).map(([name, color]) => (
              <View key={name} style={styles.colorItem}>
                <View 
                  style={[
                    styles.colorSwatch, 
                    { backgroundColor: color }
                  ]} 
                />
                <Text style={styles.colorName}>{name}</Text>
                <Text style={styles.colorValue}>{color}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={refreshAssets}>
        <RefreshCw size={16} color="#D4AF37" strokeWidth={2} />
        <Text style={styles.refreshText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#2a2a2a',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  domain: {
    fontSize: 14,
    color: '#B8B8B8',
  },
  colorsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  colorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    alignItems: 'center',
    width: 70,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  colorName: {
    fontSize: 12,
    color: '#B8B8B8',
    marginBottom: 2,
  },
  colorValue: {
    fontSize: 10,
    color: '#808080',
  },
  loadingText: {
    fontSize: 14,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 14,
    color: '#B8B8B8',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  refreshText: {
    fontSize: 14,
    color: '#D4AF37',
    marginLeft: 8,
    fontWeight: '500',
  },
});