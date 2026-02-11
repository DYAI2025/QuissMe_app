import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { api, storage } from '../../utils/api';

interface StatItem {
  stat_key: string;
  name_de: string;
  desc_de: string;
  family: string;
  value_0_100: number;
  tendency: string;
  tendency_text: string;
  bar_color: string;
  display_order: number;
  tooltip: string;
}

interface FamilyGroup {
  name_de: string;
  icon: string;
  stats: StatItem[];
}

const TENDENCY_ICONS: Record<string, string> = {
  high: '\u{1F525}',      // Fire
  medium: '\u{1F343}',    // Leaf
  building: '\u{1F331}',  // Seedling
};

const FAMILY_COLORS: Record<string, string> = {
  closeness: '#F472B6',
  alignment: '#2DD4BF',
  tension: '#A78BFA',
};

function StatBar({ stat, showValues }: { stat: StatItem; showValues: boolean }) {
  const [animWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: stat.value_0_100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [stat.value_0_100]);

  const barWidth = animWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.statItem}>
      <View style={styles.statHeader}>
        <View style={styles.statNameRow}>
          <Text style={styles.statName}>{stat.name_de}</Text>
          <Text style={styles.tendencyIcon}>{TENDENCY_ICONS[stat.tendency] || ''}</Text>
        </View>
        {showValues && (
          <Text style={styles.statValue}>{Math.round(stat.value_0_100)}%</Text>
        )}
      </View>
      
      <View style={styles.barBackground}>
        <Animated.View 
          style={[
            styles.barFill, 
            { 
              width: barWidth,
              backgroundColor: stat.bar_color,
            }
          ]} 
        />
      </View>
      
      <Text style={styles.tendencyText}>{stat.tendency_text}</Text>
    </View>
  );
}

function FamilySection({ family, familyKey, showValues }: { family: FamilyGroup; familyKey: string; showValues: boolean }) {
  const familyColor = FAMILY_COLORS[familyKey] || COLORS.night.accent;
  
  return (
    <View style={styles.familySection}>
      <View style={[styles.familyHeader, { borderLeftColor: familyColor }]}>
        <Text style={styles.familyIcon}>{family.icon}</Text>
        <Text style={styles.familyName}>{family.name_de}</Text>
        <Text style={styles.familyCount}>{family.stats.length} Stats</Text>
      </View>
      
      <BlurView intensity={12} tint="dark" style={styles.familyCard}>
        <View style={styles.familyCardInner}>
          {family.stats.map((stat) => (
            <StatBar key={stat.stat_key} stat={stat} showValues={showValues} />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

export default function StatsTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [families, setFamilies] = useState<Record<string, FamilyGroup>>({});
  const [showValues, setShowValues] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const cid = await storage.getCoupleId();
      if (!cid) {
        setError('Noch kein Paar verbunden');
        return;
      }
      
      setCoupleId(cid);
      const data = await api.getDuoStats(cid);
      setFamilies(data.families || {});
      setError(null);
    } catch (e: any) {
      console.error('Stats load error:', e);
      setError('Fehler beim Laden der Stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Hidden debug toggle: tap title 5 times
  const handleTitleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setShowValues(!showValues);
      setTapCount(0);
    }
    // Reset after 2 seconds
    setTimeout(() => setTapCount(0), 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadContainer}>
        <ActivityIndicator size="large" color={COLORS.night.accent} />
        <Text style={styles.loadText}>Lade Duo-Stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>{'\u{1F50D}'}</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadStats()}>
              <Text style={styles.retryText}>Erneut versuchen</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const familyOrder = ['closeness', 'alignment', 'tension'];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadStats(true)}
              tintColor={COLORS.night.accent}
              colors={[COLORS.night.accent]}
            />
          }
        >
          <TouchableOpacity activeOpacity={1} onPress={handleTitleTap}>
            <Text style={styles.brand}>Duo-Stats</Text>
          </TouchableOpacity>
          
          <Text style={styles.subtitle}>
            Eure Verbindung in Tendenzen – kein Urteil, nur Perspektiven.
          </Text>

          {showValues && (
            <View style={styles.debugBadge}>
              <Text style={styles.debugText}>{'\u{1F527}'} Debug-Modus aktiv</Text>
            </View>
          )}

          {familyOrder.map((familyKey) => {
            const family = families[familyKey];
            if (!family || !family.stats || family.stats.length === 0) return null;
            
            return (
              <FamilySection
                key={familyKey}
                familyKey={familyKey}
                family={family}
                showValues={showValues}
              />
            );
          })}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {'\u2728'} Stats wachsen mit jedem Quiz – organisch und ohne Druck.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.night.bg,
  },
  loadContainer: {
    flex: 1,
    backgroundColor: COLORS.night.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.m,
  },
  loadText: {
    color: COLORS.night.textSub,
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    padding: SPACING.l,
    paddingBottom: 120,
  },
  brand: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.night.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.night.textSub,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  debugBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.button,
    alignSelf: 'flex-start',
    marginBottom: SPACING.l,
  },
  debugText: {
    color: COLORS.tendency.high,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    gap: SPACING.m,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.m,
  },
  errorText: {
    color: COLORS.night.textSub,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.night.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.button,
    marginTop: SPACING.m,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Family Section
  familySection: {
    marginBottom: SPACING.xl,
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
    borderLeftWidth: 3,
    paddingLeft: SPACING.m,
    gap: SPACING.s,
  },
  familyIcon: {
    fontSize: 20,
  },
  familyName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.night.text,
    flex: 1,
  },
  familyCount: {
    fontSize: 12,
    color: COLORS.night.textSub,
  },
  familyCard: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  familyCardInner: {
    padding: SPACING.l,
    gap: SPACING.l,
  },
  
  // Stat Item
  statItem: {
    gap: SPACING.xs,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.night.text,
  },
  tendencyIcon: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 13,
    color: COLORS.night.textSub,
    fontWeight: '500',
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  tendencyText: {
    fontSize: 12,
    color: COLORS.night.textSub,
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  // Footer
  footer: {
    marginTop: SPACING.l,
    padding: SPACING.m,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.night.textSub,
    textAlign: 'center',
    opacity: 0.7,
  },
});
