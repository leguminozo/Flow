import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Package, 
  Calendar, 
  MapPin, 
  Star, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  timeSaved: {
    totalMinutes: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  moneySaved: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  deliveries: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
  subscriptions: {
    active: number;
    paused: number;
    total: number;
  };
  topCategories: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
  deliverySchedule: Array<{
    date: string;
    count: number;
    status: 'completed' | 'pending' | 'cancelled';
  }>;
}

const { width } = Dimensions.get('window');

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    timeSaved: {
      totalMinutes: 1440, // 24 horas
      thisMonth: 480,
      lastMonth: 360,
      percentageChange: 33.3
    },
    moneySaved: {
      total: 125000,
      thisMonth: 45000,
      lastMonth: 38000,
      percentageChange: 18.4
    },
    deliveries: {
      total: 45,
      thisMonth: 12,
      lastMonth: 10,
      percentageChange: 20
    },
    subscriptions: {
      active: 3,
      paused: 1,
      total: 4
    },
    topCategories: [
      { name: 'Alimentos', percentage: 45, color: '#D4AF37' },
      { name: 'Limpieza', percentage: 30, color: '#4CAF50' },
      { name: 'Cuidado Personal', percentage: 15, color: '#2196F3' },
      { name: 'Otros', percentage: 10, color: '#FF9800' }
    ],
    deliverySchedule: [
      { date: '2024-03-05', count: 2, status: 'completed' },
      { date: '2024-03-15', count: 3, status: 'pending' },
      { date: '2024-03-20', count: 1, status: 'pending' },
      { date: '2024-03-25', count: 2, status: 'pending' }
    ]
  });

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('es-CL')}`;
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage > 0) {
      return <ArrowUpRight size={16} color="#4CAF50" />;
    } else if (percentage < 0) {
      return <ArrowDownRight size={16} color="#F44336" />;
    }
    return null;
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage > 0) return '#4CAF50';
    if (percentage < 0) return '#F44336';
    return '#666666';
  };

  const renderMetricCard = (
    title: string,
    value: string,
    subtitle: string,
    icon: React.ReactNode,
    percentage?: number,
    color: string = '#D4AF37'
  ) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        {percentage !== undefined && (
          <View style={styles.percentageContainer}>
            {getPercentageIcon(percentage)}
            <Text style={[
              styles.percentageText,
              { color: getPercentageColor(percentage) }
            ]}>
              {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderCategoryChart = () => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <PieChart size={20} color="#D4AF37" />
        <Text style={styles.chartTitle}>Categorías Principales</Text>
      </View>
      <View style={styles.categoriesList}>
        {analyticsData.topCategories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDeliverySchedule = () => (
    <View style={styles.scheduleCard}>
      <View style={styles.scheduleHeader}>
        <Calendar size={20} color="#D4AF37" />
        <Text style={styles.scheduleTitle}>Próximas Entregas</Text>
      </View>
      <View style={styles.scheduleList}>
        {analyticsData.deliverySchedule.map((delivery, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleDate}>
                {new Date(delivery.date).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
              <Text style={styles.scheduleCount}>
                {delivery.count} {delivery.count === 1 ? 'producto' : 'productos'}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: delivery.status === 'completed' ? '#4CAF50' :
                               delivery.status === 'pending' ? '#FF9800' : '#F44336'
              }
            ]}>
              <Text style={styles.statusText}>
                {delivery.status === 'completed' ? 'Entregado' :
                 delivery.status === 'pending' ? 'Pendiente' : 'Cancelado'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[
        { key: 'week', label: 'Semana' },
        { key: 'month', label: 'Mes' },
        { key: 'year', label: 'Año' }
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonActive
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Text style={[
            styles.periodButtonText,
            selectedPeriod === period.key && styles.periodButtonTextActive
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Tu progreso y estadísticas</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <BarChart3 size={24} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Activity size={24} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          'Tiempo Ahorrado',
          formatTime(analyticsData.timeSaved.thisMonth),
          `Total: ${formatTime(analyticsData.timeSaved.totalMinutes)}`,
          <Clock size={20} color="#D4AF37" />,
          analyticsData.timeSaved.percentageChange,
          '#D4AF37'
        )}
        
        {renderMetricCard(
          'Dinero Ahorrado',
          formatCurrency(analyticsData.moneySaved.thisMonth),
          `Total: ${formatCurrency(analyticsData.moneySaved.total)}`,
          <DollarSign size={20} color="#4CAF50" />,
          analyticsData.moneySaved.percentageChange,
          '#4CAF50'
        )}
        
        {renderMetricCard(
          'Entregas Realizadas',
          analyticsData.deliveries.thisMonth.toString(),
          `Total: ${analyticsData.deliveries.total}`,
          <Package size={20} color="#2196F3" />,
          analyticsData.deliveries.percentageChange,
          '#2196F3'
        )}
        
        {renderMetricCard(
          'Automatizaciones',
          analyticsData.subscriptions.active.toString(),
          `${analyticsData.subscriptions.paused} pausadas`,
          <Zap size={20} color="#FF9800" />,
          undefined,
          '#FF9800'
        )}
      </View>

      {/* Charts Section */}
      <View style={styles.chartsSection}>
        {renderCategoryChart()}
        {renderDeliverySchedule()}
      </View>

      {/* Insights Section */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>💡 Insights</Text>
        <View style={styles.insightsList}>
          <View style={styles.insightItem}>
            <Star size={16} color="#D4AF37" />
            <Text style={styles.insightText}>
              Has ahorrado {formatTime(analyticsData.timeSaved.totalMinutes)} en total
            </Text>
          </View>
          <View style={styles.insightItem}>
            <TrendingUp size={16} color="#4CAF50" />
            <Text style={styles.insightText}>
              Tu ahorro aumentó {analyticsData.moneySaved.percentageChange}% este mes
            </Text>
          </View>
          <View style={styles.insightItem}>
            <MapPin size={16} color="#2196F3" />
            <Text style={styles.insightText}>
              {analyticsData.deliveries.thisMonth} entregas programadas este mes
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#D4AF37',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#999999',
  },
  chartsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
  },
  scheduleCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduleCount: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  insightsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
}); 