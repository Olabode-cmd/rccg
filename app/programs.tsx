import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert, RefreshControl } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { syncDailyStudiesWithAPI } from '@/util/db';

interface Program {
  id: number;
  title: string;
  created_at: string;
}

const cleanTitle = (title: string) => {
  return title.split('\\r\\n')[0].trim();
};

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/programs`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      console.log('Starting sync from programs page...');
      await syncDailyStudiesWithAPI();
      console.log('Sync completed successfully');
      Alert.alert('Success', 'Successfully downloaded new devotionals');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to download devotionals');
    } finally {
      setSyncing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchPrograms(),
        handleSync()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Programs',
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSync}
              style={styles.syncButton}
              disabled={syncing}
            >
              <Feather 
                name={syncing ? "loader" : "download"} 
                size={20} 
                color="#3B82F6"
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4C51BF"
            title="Pull to refresh..."
            titleColor="#64748B"
          />
        }
      >
        <View style={styles.refreshHint}>
          <Text style={styles.refreshHintText}>Pull down to get latest updates</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerText}>All Programs</Text>
          <Text style={styles.subHeaderText}>
            Select a program to view its devotionals
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : (
          <View style={styles.programsList}>
            {programs.map((program) => (
              <Link
                key={program.id}
                href={{
                  pathname: "/program/[id]",
                  params: { id: program.id, title: cleanTitle(program.title) }
                }}
                asChild
              >
                <TouchableOpacity style={styles.programCard}>
                  <View style={[styles.iconContainer, { backgroundColor: '#4C51BF' }]}>
                    <Feather name="book-open" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.programContent}>
                    <Text style={styles.programTitle}>{cleanTitle(program.title)}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#CBD5E0" />
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748B',
  },
  syncButton: {
    padding: 8,
    marginRight: 8,
  },
  programsList: {
    padding: 20,
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  programContent: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  loader: {
    marginTop: 40,
  },
  refreshHint: {
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
  },
  refreshHintText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
}); 