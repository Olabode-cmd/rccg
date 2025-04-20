import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import hymnsData from '@/assets/hymns/db.json';

interface Hymn {
  number: string;
  title: string;
  titleWithHymnNumber: string;
  chorus: string;
  verses: string[];
  sound: string;
  category: string;
}

const HomeHymns = () => {
  // Get first 4 hymns
  const displayHymns = Object.values(hymnsData.hymns).slice(0, 4);

  return (
    <View style={styles.hymnsSection}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Hymns</Text>
        <Link href="/hymns" asChild>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View style={styles.hymnsList}>
        {displayHymns.map((hymn: Hymn) => (
          <Link
            key={hymn.number}
            href={{
              pathname: "/hymn/[id]",
              params: { id: hymn.number }
            }}
            asChild
          >
            <TouchableOpacity style={styles.hymnCard}>
              <View style={[styles.iconContainer, { backgroundColor: '#4C51BF' }]}>
                <Feather name="music" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.hymnContent}>
                <Text style={styles.hymnTitle}>{hymn.title}</Text>
                <Text style={styles.hymnNumber}>Hymn {hymn.number}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CBD5E0" />
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hymnsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  hymnsList: {
    flexDirection: 'column',
  },
  hymnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hymnContent: {
    flex: 1,
  },
  hymnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  hymnNumber: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default HomeHymns; 