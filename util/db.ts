// db.ts
import * as SQLite from "expo-sqlite";
import { Platform } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from 'react'

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

export interface Bookmark {
  id: number;
  devotional_id: number;
  program: string;
  date: string;
  topic: string;
  content: string;
  created_at: string;
}
export interface Program {
  id: number;
  title: string;
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
    // Create devotionals table if it doesn't exist
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

    // Create bookmarks table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        devotional_id INTEGER NOT NULL,
        program TEXT NOT NULL,
        date TEXT NOT NULL,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        UNIQUE(devotional_id)
      );
    `);

    // Create Prograns table
     await db.execAsync(`
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
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
    const escapedContent = devotional.content.replace(/'/g, "''").replace(/\n/g, '\\n');
    const escapedTopic = devotional.topic.replace(/'/g, "''");
    
    await db.execAsync(`INSERT OR REPLACE INTO devotionals (id, program, date, topic, content, created_at) VALUES (${devotional.id}, '${devotional.program}', '${devotional.date}', '${escapedTopic}', '${escapedContent}', '${devotional.created_at}')`);
    return true;
  } catch (error) {
    console.error('Error saving devotional:', error);
    return false;
  }
};

export const getDailyStudies = async (program: string, month?: string) => {
  const db = await getDb();
  try {
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
    
    const result = await db.getAllAsync<Devotional>(query, params);
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
    await initDatabase();
    const studies = await fetchDailyStudiesFromAPI();
    
    for (const study of studies) {
      await saveDailyStudy({
        id: study.id,
        program: study.program,
        date: study.date,
        topic: study.topic,
        content: study.content,
        created_at: study.created_at
      });
    }
  } catch (error) {
    console.error('Error syncing daily studies:', error);
    throw error;
  }
}

// Bookmark related functions
export const addBookmark = async (devotional: Devotional) => {
  const db = await getDb();
  try {
    await initDatabase();
    const escapedContent = devotional.content.replace(/'/g, "''").replace(/\n/g, '\\n');
    const escapedTopic = devotional.topic.replace(/'/g, "''");
    
    await db.execAsync(`
      INSERT OR REPLACE INTO bookmarks 
      (devotional_id, program, date, topic, content, created_at)
      VALUES 
      (${devotional.id}, '${devotional.program}', '${devotional.date}', '${escapedTopic}', '${escapedContent}', '${devotional.created_at}')
    `);
    return true;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }
};

export const removeBookmark = async (devotionalId: number) => {
  const db = await getDb();
  try {
    await db.execAsync(`DELETE FROM bookmarks WHERE devotional_id = ${devotionalId}`);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isBookmarked = async (devotionalId: number): Promise<boolean> => {
  const db = await getDb();
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM bookmarks WHERE devotional_id = ?',
      [devotionalId]
    );
    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }
};

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const db = await getDb();
  try {
    const bookmarks = await db.getAllAsync<Bookmark>(
      'SELECT * FROM bookmarks ORDER BY date DESC'
    );
    return bookmarks;
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

// Programs
let programsCache: Program[] | null = null;
export const fetchAndSyncPrograms = async (
  forceRefresh = false
): Promise<Program[]> => {
  // Ensure database is initialized first
  await initDatabase();

  try {
    // Always try API first
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/programs`);
    if (response.ok) {
      const data = await response.json();
      // Save to SQLite
      await savePrograms(data);
      programsCache = data;
      return data;
    }
  } catch (error) {
    console.log("API fetch failed, falling back to local data");
  }

  // If API fails, try to get local data
  try {
    const localPrograms = await getPrograms();
    if (localPrograms && localPrograms.length > 0) {
      programsCache = localPrograms;
      return localPrograms;
    }
  } catch (error) {
    console.error("Error getting local programs:", error);
  }

  // If both API and local data fail, return empty array
  return [];
};

export const usePrograms = (initialFetch = true) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPrograms = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await fetchAndSyncPrograms(forceRefresh);
      setPrograms(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch programs")
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (initialFetch) {
      loadPrograms();
    }
  }, []);

  return {
    programs,
    loading,
    error,
    refreshPrograms: () => loadPrograms(true),
    loadPrograms,
  };
};

// Make sure to properly handle database operations
// In util/db.ts

export const savePrograms = async (programs: Program[]) => {
  const db = await getDb();
  try {
    // Delete existing programs
    await db.execAsync('DELETE FROM programs');
    
    // Insert new programs
    for (const program of programs) {
      const escapedTitle = program.title.replace(/'/g, "''");
      await db.execAsync(`
        INSERT INTO programs (id, title, created_at)
        VALUES (${program.id}, '${escapedTitle}', '${program.created_at}')
      `);
    }
  } catch (error) {
    console.error('Error saving programs:', error);
    throw error;
  }
};


export const getPrograms = async (): Promise<Program[]> => {
  const db = await getDb();
  try {
    const result = await db.getAllAsync<Program>("SELECT * FROM programs");
    return result || [];
  } catch (error) {
    console.error("Error getting programs:", error);
    return [];
  }
};

