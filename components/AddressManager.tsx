import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MapPin, Plus, CreditCard as Edit3, Trash2, Check, X, Chrome as Home, Briefcase, Coffee } from 'lucide-react-native';
import { Address } from '@/types';

interface AddressManagerProps {
  addresses: Address[];
  onAddressesChange: (addresses: Address[]) => void;
  onClose?: () => void;
}

export default function AddressManager({ addresses, onAddressesChange, onClose }: AddressManagerProps) {
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    notes: '',
    isDefault: false
  });

  const addressTypes = [
    { id: 'Casa', icon: Home, label: 'Casa' },
    { id: 'Trabajo', icon: Briefcase, label: 'Trabajo' },
    { id: 'Ocio', icon: Coffee, label: 'Ocio' },
    { id: 'Otro', icon: MapPin, label: 'Otro' }
  ];

  // Sort addresses to show default first
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return 0;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      notes: '',
      isDefault: false
    });
    setEditingAddress(null);
    setIsAddingNew(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      notes: address.notes || '',
      isDefault: address.isDefault
    });
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    let updatedAddresses = [...addresses];

    if (editingAddress) {
      // Editando dirección existente
      updatedAddresses = addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData }
          : formData.isDefault ? { ...addr, isDefault: false } : addr
      );
    } else {
      // Agregando nueva dirección
      const newId = Math.max(...addresses.map(a => a.id), 0) + 1;
      const newAddress: Address = {
        id: newId,
        ...formData
      };

      if (formData.isDefault) {
        updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
      }
      
      updatedAddresses.push(newAddress);
    }

    // Si no hay dirección por defecto, hacer la primera como default
    if (!updatedAddresses.some(addr => addr.isDefault) && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    // Sort addresses to put default first
    const sortedUpdatedAddresses = updatedAddresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });

    onAddressesChange(sortedUpdatedAddresses);
    resetForm();
    
    // Show success message
    Alert.alert(
      'Éxito', 
      editingAddress ? 'Dirección actualizada correctamente' : 'Dirección agregada correctamente'
    );
  };

  const handleDelete = (addressId: number) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    
    Alert.alert(
      'Eliminar Dirección',
      `¿Estás seguro de que deseas eliminar "${addressToDelete?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            let updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            
            // Si eliminamos la dirección por defecto, hacer la primera como default
            if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
              updatedAddresses[0].isDefault = true;
            }
            
            // Sort addresses to put default first
            const sortedUpdatedAddresses = updatedAddresses.sort((a, b) => {
              if (a.isDefault && !b.isDefault) return -1;
              if (!a.isDefault && b.isDefault) return 1;
              return 0;
            });
            
            onAddressesChange(sortedUpdatedAddresses);
            Alert.alert('Éxito', 'Dirección eliminada correctamente');
          }
        }
      ]
    );
  };

  const handleSetDefault = (addressId: number) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    // Sort addresses to put the new default first
    const sortedUpdatedAddresses = updatedAddresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
    
    onAddressesChange(sortedUpdatedAddresses);
    Alert.alert('Éxito', 'Dirección principal actualizada');
  };

  const getAddressIcon = (name: string) => {
    const type = addressTypes.find(type => type.id === name);
    return type ? type.icon : MapPin;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Direcciones</Text>
        <Text style={styles.subtitle}>Administra tus ubicaciones de entrega</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#CCCCCC" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add New Address Button */}
        {!isAddingNew && !editingAddress && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Plus size={20} color="#000000" strokeWidth={2} />
            <Text style={styles.addButtonText}>Agregar Nueva Dirección</Text>
          </TouchableOpacity>
        )}

        {/* Address Form */}
        {(isAddingNew || editingAddress) && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </Text>

            {/* Address Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Dirección</Text>
              <View style={styles.typeSelector}>
                {addressTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        formData.name === type.id && styles.typeButtonSelected
                      ]}
                      onPress={() => setFormData({ ...formData, name: type.id })}
                    >
                      <IconComponent 
                        size={20} 
                        color={formData.name === type.id ? "#000000" : "#D4AF37"} 
                        strokeWidth={2} 
                      />
                      <Text style={[
                        styles.typeButtonText,
                        formData.name === type.id && styles.typeButtonTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Custom Name Input (if "Otro" is selected) */}
            {formData.name === 'Otro' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre Personalizado *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Casa de mis padres"
                  placeholderTextColor="#666666"
                  value={formData.name === 'Otro' ? '' : formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>
            )}

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Av. Las Condes 12345, Las Condes"
                placeholderTextColor="#666666"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
              />
            </View>

            {/* City Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ciudad *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Santiago"
                placeholderTextColor="#666666"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas de Entrega</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Ej: Portón azul, timbre 2B, dejar con el conserje"
                placeholderTextColor="#666666"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Default Address Toggle */}
            <TouchableOpacity 
              style={styles.defaultToggle}
              onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
            >
              <View style={[
                styles.checkbox,
                formData.isDefault && styles.checkboxSelected
              ]}>
                {formData.isDefault && (
                  <Check size={16} color="#000000" strokeWidth={2} />
                )}
              </View>
              <View style={styles.defaultToggleContent}>
                <Text style={styles.defaultToggleText}>Establecer como dirección principal</Text>
                <Text style={styles.defaultToggleSubtext}>
                  La dirección principal aparecerá primero en la lista
                </Text>
              </View>
            </TouchableOpacity>

            {/* Form Actions */}
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {editingAddress ? 'Actualizar' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Addresses List */}
        {!isAddingNew && !editingAddress && (
          <View style={styles.addressesList}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Direcciones Guardadas</Text>
              <Text style={styles.sectionSubtitle}>
                La dirección principal aparece primero
              </Text>
            </View>
            
            {addresses.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={48} color="#666666" strokeWidth={1} />
                <Text style={styles.emptyStateTitle}>No hay direcciones guardadas</Text>
                <Text style={styles.emptyStateDescription}>
                  Agrega tu primera dirección para comenzar a recibir entregas
                </Text>
              </View>
            ) : (
              sortedAddresses.map((address, index) => {
                const IconComponent = getAddressIcon(address.name);
                
                return (
                  <View key={address.id} style={[
                    styles.addressCard,
                    address.isDefault && styles.addressCardDefault
                  ]}>
                    {address.isDefault && (
                      <View style={styles.defaultIndicator}>
                        <Text style={styles.defaultIndicatorText}>PRINCIPAL</Text>
                      </View>
                    )}
                    
                    <View style={styles.addressHeader}>
                      <View style={styles.addressInfo}>
                        <View style={styles.addressTitleRow}>
                          <IconComponent size={20} color="#D4AF37" strokeWidth={2} />
                          <Text style={styles.addressName}>{address.name}</Text>
                          {address.isDefault && (
                            <View style={styles.defaultBadge}>
                              <Text style={styles.defaultBadgeText}>Principal</Text>
                            </View>
                          )}
                          {index === 0 && address.isDefault && (
                            <View style={styles.topPositionBadge}>
                              <Text style={styles.topPositionText}>🔝</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.addressText}>{address.address}</Text>
                        <Text style={styles.addressCity}>{address.city}</Text>
                        {address.notes && (
                          <Text style={styles.addressNotes}>📝 {address.notes}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.addressActions}>
                      {!address.isDefault && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleSetDefault(address.id)}
                        >
                          <Text style={styles.actionButtonText}>Hacer Principal</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleEdit(address)}
                      >
                        <Edit3 size={16} color="#D4AF37" strokeWidth={2} />
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>
                      
                      {addresses.length > 1 && (
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDelete(address.id)}
                        >
                          <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                          <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
                            Eliminar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#555555',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    minWidth: 100,
  },
  typeButtonSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: '#000000',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#555555',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  defaultToggleContent: {
    flex: 1,
  },
  defaultToggleText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  defaultToggleSubtext: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  addressesList: {
    paddingBottom: 100,
  },
  sectionTitleContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'relative',
  },
  addressCardDefault: {
    borderColor: '#D4AF37',
    backgroundColor: '#1a1a1a',
  },
  defaultIndicator: {
    position: 'absolute',
    top: -8,
    left: 20,
    right: 20,
    backgroundColor: '#D4AF37',
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  defaultIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  addressHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  topPositionBadge: {
    marginLeft: 8,
  },
  topPositionText: {
    fontSize: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressCity: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  addressNotes: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#D4AF37',
    marginLeft: 4,
    fontWeight: '500',
  },
});