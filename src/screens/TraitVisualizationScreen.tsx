import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { DUO_TRAITS, getTraitByKey, TraitLevel } from '../data/traits';

export default function TraitVisualizationScreen() {
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [traitLevels, setTraitLevels] = useState<{ [key: string]: TraitLevel }>({
    closeness: 'medium',
    alignment: 'high',
    tension: 'medium',
    repair: 'high',
    clarity: 'medium',
    appreciation: 'high',
    ritual: 'medium',
    play: 'high',
    boundaries: 'medium',
    fairness: 'high',
  });

  const getBarWidth = (level: TraitLevel) => {
    switch (level) {
      case 'high': return '85%';
      case 'medium': return '55%';
      case 'building': return '30%';
      default: return '50%';
    }
  };

  const getBarColor = (level: TraitLevel) => {
    switch (level) {
      case 'high': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'building': return '#6366f1';
      default: return '#8b8b93';
    }
  };

  const selectedTraitData = selectedTrait ? getTraitByKey(selectedTrait) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Eure Dynamik</Text>
        <Text style={styles.subtitle}>10 Aspekte eurer Beziehung</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Main Visual */}
        <View style={styles.traitGrid}>
          {DUO_TRAITS.map((trait, index) => {
            const level = traitLevels[trait.key] || 'medium';
            const barWidth = getBarWidth(level);
            const barColor = getBarColor(level);
            
            return (
              <TouchableOpacity
                key={trait.key}
                style={styles.traitCard}
                onPress={() => setSelectedTrait(trait.key)}
                activeOpacity={0.7}
              >
                <View style={styles.traitRow}>
                  <View style={styles.traitLabel}>
                    <Text style={styles.traitName}>{trait.nameDe}</Text>
                    <View style={[styles.levelDot, { backgroundColor: barColor }]} />
                  </View>
                  <Text style={styles.traitValue}>
                    {level === 'high' ? 'Stark' : level === 'medium' ? 'Da' : 'Wächst'}
                  </Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View style={styles.barBackground}>
                    <Animated.View 
                      style={[
                        styles.barFill, 
                        { width: barWidth, backgroundColor: barColor }
                      ]} 
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Stark</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Da</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
            <Text style={styles.legendText}>Wächst</Text>
          </View>
        </View>
      </ScrollView>

      {/* Trait Detail Modal */}
      {selectedTrait && selectedTraitData && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            onPress={() => setSelectedTrait(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTraitData.nameDe}</Text>
              <Text style={styles.modalTagline}>{selectedTraitData.taglineDe}</Text>
            </View>

            <View style={styles.traitOptions}>
              {(Object.keys(traitLevels) as string[]).map((key) => {
                const trait = getTraitByKey(key);
                if (!trait) return null;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.traitOption,
                      selectedTrait === key && styles.traitOptionSelected
                    ]}
                    onPress={() => {
                      setTraitLevels(prev => ({
                        ...prev,
                        [key]: traitLevels[key] === 'high' ? 'medium' : traitLevels[key] === 'medium' ? 'building' : 'high'
                      }));
                    }}
                  >
                    <Text style={styles.traitOptionText}>{trait.nameDe}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.copySection}>
              <Text style={styles.copyLabel}>
                {traitLevels[selectedTrait] === 'high' ? '🌟 Stark' : traitLevels[selectedTrait] === 'medium' ? '✨ Da' : '🌱 Wächst'}
              </Text>
              <Text style={styles.copyText}>
                {selectedTraitData.copy[traitLevels[selectedTrait] || 'medium'].de}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setSelectedTrait(null)}
            >
              <Text style={styles.closeBtnText}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f2f3f5',
    letterSpacing: -0.02,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b8b93',
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  traitGrid: {
    gap: 12,
  },
  traitCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  traitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  traitLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f2f3f5',
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  traitValue: {
    fontSize: 12,
    color: '#8b8b93',
  },
  barContainer: {
    height: 8,
  },
  barBackground: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8b8b93',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#141416',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f2f3f5',
  },
  modalTagline: {
    fontSize: 14,
    color: '#8b8b93',
    marginTop: 4,
  },
  traitOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  traitOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  traitOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  traitOptionText: {
    fontSize: 12,
    color: '#f2f3f5',
  },
  copySection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  copyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a78bfa',
    marginBottom: 8,
  },
  copyText: {
    fontSize: 16,
    color: '#f2f3f5',
    lineHeight: 24,
  },
  closeBtn: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f2f3f5',
  },
});
