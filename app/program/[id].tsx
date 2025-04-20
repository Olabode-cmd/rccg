import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { getDailyStudyByDate, getDailyStudies, initDatabase, Devotional as DBDevotional, syncDailyStudiesWithAPI } from '@/util/db';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

interface Devotional {
  id: number;
  program: string;
  date: string;
  topic: string;
  content: string;
  created_at: string;
}

export default function ProgramDetails() {
  const { id, title } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setupDatabase();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDailyStudies();
      if (selectedDate) {
        await loadDevotional(selectedDate);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const setupDatabase = async () => {
    try {
      await initDatabase();
      // Sync first to ensure we have data
      await syncDailyStudiesWithAPI();
      await loadDailyStudies();
    } catch (error) {
      console.error('Error setting up database:', error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadDevotional(selectedDate);
    }
  }, [selectedDate]);

  const loadDailyStudies = async () => {
    try {
      console.log('Loading daily studies for program:', title);
      const studies = await getDailyStudies(title as string);
      const marked = studies.reduce((acc: {[key: string]: any}, study: DBDevotional) => {
        acc[study.date] = { marked: true, dotColor: '#4C51BF' };
        return acc;
      }, {});
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading daily studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDevotional = async (date: string) => {
    try {
      console.log('Loading devotional for program:', title, 'date:', date);
      const studies = await getDailyStudies(title as string);
      const study = studies.find(s => s.date === date);
      setDevotional(study as Devotional | null);
    } catch (error) {
      console.error('Error loading devotional:', error);
      setDevotional(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: title as string,
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
        {loading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
        ) : (
          <>
            <View style={styles.refreshHint}>
              <Text style={styles.refreshHintText}>Pull down to get latest updates</Text>
            </View>
            <Calendar
              style={styles.calendar}
              theme={{
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#1E293B',
                selectedDayBackgroundColor: '#4C51BF',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#4C51BF',
                dayTextColor: '#1E293B',
                textDisabledColor: '#CBD5E0',
                dotColor: '#4C51BF',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#4C51BF',
                monthTextColor: '#1E293B',
                indicatorColor: '#4C51BF',
                disabledArrowColor: '#CBD5E0',
              }}
              maxDate={format(new Date(), 'yyyy-MM-dd')}
              markedDates={{
                ...markedDates,
                [selectedDate]: {
                  ...markedDates[selectedDate],
                  selected: true,
                },
              }}
              onDayPress={(day: DateData) => {
                const today = new Date();
                const selectedDay = new Date(day.dateString);
                if (selectedDay <= today) {
                  setSelectedDate(day.dateString);
                }
              }}
            />

            <View style={styles.devotionalContainer}>
              {devotional ? (
                <>
                  <Text style={styles.date}>
                    {format(new Date(selectedDate), 'MMMM d, yyyy')}
                  </Text>
                  <Text style={styles.topic}>{devotional.topic}</Text>
                  <Text numberOfLines={3} style={styles.content}>{devotional.content}</Text>
                  <TouchableOpacity 
                    style={styles.readButton}
                    onPress={() => router.push({
                      pathname: '/devotional/[id]',
                      params: {
                        id: devotional.id,
                        title: devotional.topic,
                        date: devotional.date,
                        content: devotional.content,
                        program: devotional.program
                      }
                    })}
                  >
                    <Text style={styles.readButtonText}>Read Devotional</Text>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyStateText}>
                  No devotional available for this date
                </Text>
              )}
            </View>
          </>
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
  loader: {
    marginTop: 40,
  },
  calendar: {
    marginBottom: 20,
  },
  devotionalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginTop: 0,
  },
  date: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  topic: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: 20,
  },
  refreshHint: {
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshHintText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4C51BF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  readButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 