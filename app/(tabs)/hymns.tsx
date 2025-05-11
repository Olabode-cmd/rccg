import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import hymnsData from '@/assets/hymns/db.json';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';
import AdBanner from '@/components/AdBanner';
import { useInterstitial } from '@/components/AdInterstitial';

interface Hymn {
  number: string;
  title: string;
  titleWithHymnNumber: string;
  chorus: string;
  verses: string[];
  sound: string;
  category: string;
}

const ITEMS_PER_PAGE = 20;

export default function Hymns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const allCategories = Object.values(hymnsData.hymns).map(hymn => hymn.category);
    return ['all', ...new Set(allCategories)];
  }, []);

  const filteredHymns = useMemo(() => {
    let hymns = Object.values(hymnsData.hymns);
    
    if (selectedCategory && selectedCategory !== 'all') {
      hymns = hymns.filter(hymn => hymn.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      hymns = hymns.filter(hymn => 
        hymn.title.toLowerCase().includes(query) ||
        hymn.number.includes(query)
      );
    }

    return hymns;
  }, [searchQuery, selectedCategory]);

  const paginatedHymns = useMemo(() => {
    const startIndex = 0;
    const endIndex = page * ITEMS_PER_PAGE;
    return filteredHymns.slice(startIndex, endIndex);
  }, [filteredHymns, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory]);

  const renderHymnItem = useCallback(({ item }: { item: Hymn }) => (
    <Link
      key={item.number}
      href={{
        pathname: "/hymn/[id]",
        params: { id: item.number }
      }}
      asChild
    >
      <TouchableOpacity style={styles.hymnCard}>
        <View style={[styles.iconContainer, { backgroundColor: '#4C51BF' }]}>
          <Feather name="music" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.hymnContent}>
          <Text style={styles.hymnTitle}>{item.title}</Text>
          <Text style={styles.hymnNumber}>Hymn {item.number}</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CBD5E0" />
      </TouchableOpacity>
    </Link>
  ), []);

  const handleEndReached = useCallback(() => {
    if (paginatedHymns.length < filteredHymns.length) {
      setPage(prev => prev + 1);
    }
  }, [paginatedHymns.length, filteredHymns.length]);

  const renderFooter = useCallback(() => {
    if (paginatedHymns.length >= filteredHymns.length) {
      return null;
    }
    return (
      <View style={styles.loadingMore}>
        <Text style={styles.loadingMoreText}>Loading more hymns...</Text>
      </View>
    );
  }, [paginatedHymns.length, filteredHymns.length]);

  useEffect(() => {
    mobileAds().initialize();
  }, []);

  // Show interstitial ad on mount (demo)
  const { show: showInterstitial, loaded: interstitialLoaded } = useInterstitial();
  useEffect(() => {
    if (interstitialLoaded) {
      showInterstitial();
    }
  }, [interstitialLoaded]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: 'Hymns',
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hymns</Text>
        </View>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search hymns..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>

        <FlatList
          data={paginatedHymns}
          renderItem={renderHymnItem}
          keyExtractor={item => item.number}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
        />
        <AdBanner />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
    paddingTop: 24,
    paddingHorizontal: 8,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
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
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: '#64748B',
    fontSize: 14,
  },
}); 