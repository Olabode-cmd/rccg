import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { isBookmarked, addBookmark, removeBookmark, initDatabase } from '@/util/db';

interface DevotionalParams extends Record<string, string> {
  id: string;
  title: string;
  date: string;
  content: string;
  program: string;
}

export default function DevotionalDetails() {
  const params = useLocalSearchParams<DevotionalParams>();
  const [isBookmarkedState, setIsBookmarkedState] = useState(false);

  useEffect(() => {
    setupAndCheckBookmark();
  }, []);

  const setupAndCheckBookmark = async () => {
    try {
      await initDatabase();
      await checkBookmarkStatus();
    } catch (error) {
      // Handle error silently
    }
  };

  const checkBookmarkStatus = async () => {
    const status = await isBookmarked(parseInt(params.id));
    setIsBookmarkedState(status);
  };

  const toggleBookmark = async () => {
    try {
      if (isBookmarkedState) {
        await removeBookmark(parseInt(params.id));
      } else {
        await addBookmark({
          id: parseInt(params.id),
          program: params.program,
          date: params.date,
          topic: params.title,
          content: params.content,
          created_at: new Date().toISOString(),
        });
      }
      setIsBookmarkedState(!isBookmarkedState);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const formattedContent = params.content?.replace(/\\n/g, '\n');

  return (
    <>
      <Stack.Screen
        options={{
          title: params.program,
          headerBackTitle: 'Back',
          headerRight: () => (
            <TouchableOpacity 
              onPress={toggleBookmark}
              style={styles.bookmarkButton}
            >
              {isBookmarkedState ? (
                <FontAwesome name="bookmark" size={20} color="#3B82F6" />
              ) : (
                <Feather name="bookmark" size={20} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.date}>
            {format(new Date(params.date), 'MMMM d, yyyy')}
          </Text>
          <Text style={styles.title}>{params.title}</Text>
          <Text style={styles.devotionalContent}>{formattedContent}</Text>
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
  date: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  devotionalContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
  bookmarkButton: {
    padding: 8,
    marginRight: 8,
  },
}); 