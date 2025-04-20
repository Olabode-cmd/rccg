import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Program {
  id: number;
  title: string;
  created_at: string;
}

interface OtherProgramsProps {
  programs: Program[];
  loading: boolean;
}

const cleanTitle = (title: string) => {
  // Remove the WebKit form boundary text that appears in some titles
  return title.split('\\r\\n')[0].trim();
};

const OtherPrograms = ({ programs, loading }: OtherProgramsProps) => {
  // Only show first 4 programs
  const displayPrograms = programs.slice(0, 4);

  return (
    <View style={styles.programsSection}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Other Programs</Text>
        <Link href="/programs" asChild>
          <TouchableOpacity>
            <Text style={styles.seeMoreText}>See more</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View style={styles.programsList}>
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : (
          displayPrograms.map((program) => (
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
                  <View style={styles.programHeader}>
                    <Text style={styles.programTitle}>{cleanTitle(program.title)}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#CBD5E0" />
              </TouchableOpacity>
            </Link>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  programsSection: {
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
  programsList: {
    flexDirection: 'column',
  },
  programCard: {
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
  programContent: {
    flex: 1,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  loader: {
    marginVertical: 20,
  },
});

export default OtherPrograms; 