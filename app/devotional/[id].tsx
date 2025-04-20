import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';

interface DevotionalParams extends Record<string, string> {
  id: string;
  title: string;
  date: string;
  content: string;
  program: string;
}

export default function DevotionalDetails() {
  const params = useLocalSearchParams<DevotionalParams>();

  const formattedContent = params.content?.replace(/\\n/g, '\n');

  return (
    <>
      <Stack.Screen
        options={{
          title: params.program,
          headerBackTitle: 'Back',
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
}); 