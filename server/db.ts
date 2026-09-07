import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertStudentActivity, InsertUser, QuizSettings, StudentActivity, quizSettings, studentActivities, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      const normalized = user[field] ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = 'admin';
    updateSet.role = 'admin';
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function recordStudentActivity(activity: InsertStudentActivity) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record activity: database not available");
    return null;
  }
  const result = await db.insert(studentActivities).values(activity);
  return result;
}

export async function listRecentStudentActivities(): Promise<StudentActivity[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentActivities).orderBy(desc(studentActivities.lastSeenAt)).limit(500);
}

export async function getQuizSettings(): Promise<QuizSettings> {
  const fallback = { id: 1, durationMinutes: 30, questionCount: 25, updatedAt: new Date() };
  const db = await getDb();
  if (!db) return fallback;
  const result = await db.select().from(quizSettings).where(eq(quizSettings.id, 1)).limit(1);
  return result[0] ?? fallback;
}

export async function updateQuizSettings(durationMinutes: number, questionCount: number) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(quizSettings).values({ id: 1, durationMinutes, questionCount }).onDuplicateKeyUpdate({ set: { durationMinutes, questionCount } });
  return getQuizSettings();
}
