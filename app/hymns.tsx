import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, Link } from 'expo-router';
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

export default function Hymns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Hymns',
        }}
      />
      <View style={styles.container}>
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

        {/* <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={{ height: 60 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
                numberOfLines={1}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView> */}

        <ScrollView style={styles.hymnsList}>
          {filteredHymns.map((hymn) => (
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
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
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
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#4C51BF',
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  hymnsList: {
    paddingHorizontal: 16,
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