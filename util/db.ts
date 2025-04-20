// db.ts
import * as SQLite from "expo-sqlite";
import { Platform } from 'react-native';
import axios from 'axios';

export interface Devotional {
  id: number;
  program: string;
  date: string;
  topic: string;
  content: string;
  created_at: string;
}

export interface DailyStudy {
  id: number;
  program: string;
  date: string;
  topic: string;
  content: string;
  created_at: string;
}

let db: SQLite.SQLiteDatabase | null = null;
let isInitialized = false;

export const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  if (Platform.OS === "web") {
    return {
      execAsync: () => Promise.resolve(),
      getAllAsync: () => Promise.resolve([]),
      getFirstAsync: () => Promise.resolve(null),
    } as unknown as SQLite.SQLiteDatabase;
  }
  db = await SQLite.openDatabaseAsync("rccg.db");
  return db;
};

export const initDatabase = async () => {
  if (isInitialized) {
    return;
  }

  const db = await getDb();
  
  try {
    // Create table if it doesn't exist (don't drop)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS devotionals (
        id INTEGER PRIMARY KEY,
        program TEXT,
        date TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    console.log('Database initialized');
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const saveDailyStudy = async (devotional: Devotional) => {
  const db = await getDb();
  try {
    console.log('Saving devotional to database:', devotional);
    // Escape single quotes and clean content
    const escapedContent = devotional.content.replace(/'/g, "''").replace(/\n/g, '\\n');
    const escapedTopic = devotional.topic.replace(/'/g, "''");
    
    const queryString = `INSERT OR REPLACE INTO devotionals (id, program, date, topic, content, created_at) VALUES (${devotional.id}, '${devotional.program}', '${devotional.date}', '${escapedTopic}', '${escapedContent}', '${devotional.created_at}')`;
    console.log('Executing query:', queryString);
    await db.execAsync(queryString);
    console.log('Successfully saved devotional:', devotional.id);
    return true;
  } catch (error) {
    console.error('Error saving devotional:', error);
    return false;
  }
};

export const getDailyStudies = async (program: string, month?: string) => {
  const db = await getDb();
  try {
    // Make sure database is initialized
    await initDatabase();
    
    let query = 'SELECT * FROM devotionals';
    const params: any[] = [];

    if (program) {
      query += ' WHERE program = ?';
      params.push(program);
    }

    if (month) {
      query += params.length ? ' AND' : ' WHERE';
      query += ' strftime("%Y-%m", date) = ?';
      params.push(month);
    }

    query += ' ORDER BY date DESC';
    
    console.log('Executing query:', query, 'with params:', params);
    const result = await db.getAllAsync<Devotional>(query, params);
    console.log('Query result:', result);
    return result;
  } catch (error) {
    console.error('Error getting devotionals:', error);
    return [];
  }
};

export const getDailyStudyByDate = async (program: string, date: string) => {
  const db = await getDb();
  try {
    const result = await db.getFirstAsync<Devotional>(
      'SELECT * FROM devotionals WHERE program = ? AND date = ?',
      [program, date]
    );
    return result;
  } catch (error) {
    console.error('Error getting devotional:', error);
    return null;
  }
};

// API Functions with new names
export async function fetchDailyStudiesFromAPI(): Promise<DailyStudy[]> {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/daily-study`);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily studies:', error);
    throw error;
  }
}

export async function fetchDailyStudyByDateFromAPI(date: string): Promise<DailyStudy | null> {
  try {
    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/daily-study/${date}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching daily study for date ${date}:`, error);
    return null;
  }
}

export async function syncDailyStudiesWithAPI(): Promise<void> {
  try {
    // Ensure database is initialized first
    await initDatabase();
    
    console.log('Starting sync...');
    const studies = await fetchDailyStudiesFromAPI();
    console.log('Studies to sync:', studies.length);
    
    for (const study of studies) {
      console.log('Saving study:', study);
      await saveDailyStudy({
        id: study.id,
        program: study.program,
        date: study.date,
        topic: study.topic,
        content: study.content,
        created_at: study.created_at
      });
    }
    console.log('Sync completed successfully');
  } catch (error) {
    console.error('Error in syncDailyStudiesWithAPI:', error);
    throw error;
  }
}