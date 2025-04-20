import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import hymnsData from '@/assets/hymns/db.json';

interface HymnParams extends Record<string, string> {
  id: string;
}

interface Hymn {
  number: string;
  title: string;
  titleWithHymnNumber: string;
  chorus: string;
  verses: string[];
  sound: string;
  category: string;
}

export default function HymnDetails() {
  const params = useLocalSearchParams<HymnParams>();
  const hymn = hymnsData.hymns[params.id as keyof typeof hymnsData.hymns] as Hymn;

  if (!hymn) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Hymn not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Hymn ${hymn.number}`,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{hymn.title}</Text>
          <Text style={styles.category}>Category: {hymn.category}</Text>

          {hymn.chorus && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chorus:</Text>
              <Text style={styles.text}>{hymn.chorus.replace(/\\n/g, '\n')}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verses:</Text>
            {hymn.verses.map((verse: string, index: number) => (
              <View key={index} style={styles.verse}>
                <Text style={styles.verseNumber}>{index + 1}.</Text>
                <Text style={styles.text}>{verse.replace(/\\n/g, '\n')}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  verse: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  verseNumber: {
    fontSize: 16,
    color: '#3B82F6',
    marginRight: 8,
    width: 24,
  },
  text: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
}); 