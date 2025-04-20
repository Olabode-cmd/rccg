import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { getBookmarks, removeBookmark, Bookmark, initDatabase } from '@/util/db';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      await initDatabase();
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (bookmark: Bookmark) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this devotional from your bookmarks?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeBookmark(bookmark.devotional_id);
              await loadBookmarks(); // Refresh the list
            } catch (error) {
              console.error('Error removing bookmark:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bookmarks',
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bookmark" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>No bookmarks available</Text>
          </View>
        ) : (
          <View style={styles.bookmarksList}>
            {bookmarks.map((bookmark) => (
              <TouchableOpacity
                key={bookmark.id}
                style={styles.bookmarkCard}
                onPress={() => router.push({
                  pathname: '/devotional/[id]',
                  params: {
                    id: bookmark.devotional_id,
                    title: bookmark.topic,
                    date: bookmark.date,
                    content: bookmark.content,
                    program: bookmark.program
                  }
                })}
              >
                <View style={styles.bookmarkContent}>
                  <Text style={styles.date}>
                    {format(new Date(bookmark.date), 'MMMM d, yyyy')}
                  </Text>
                  <Text style={styles.program}>{bookmark.program}</Text>
                  <Text style={styles.topic}>{bookmark.topic}</Text>
                  <Text numberOfLines={2} style={styles.preview}>
                    {bookmark.content}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveBookmark(bookmark)}
                >
                  <Feather name="trash-2" size={20} color="#EF4444" />
                </TouchableOpacity>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
  },
  bookmarksList: {
    padding: 16,
  },
  bookmarkCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkContent: {
    flex: 1,
    padding: 16,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  program: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 4,
  },
  topic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  removeButton: {
    padding: 16,
    justifyContent: 'center',
  },
}); 