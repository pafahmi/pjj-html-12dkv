import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const studentActivities = mysqlTable("student_activities", {
  id: int("id").autoincrement().primaryKey(),
  studentName: varchar("studentName", { length: 160 }).notNull(),
  className: varchar("className", { length: 32 }).notNull(),
  activityType: varchar("activityType", { length: 48 }).notNull(),
  activityLabel: varchar("activityLabel", { length: 180 }).notNull(),
  progress: int("progress").default(0).notNull(),
  score: int("score"),
  isOnline: int("isOnline").default(1).notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const quizSettings = mysqlTable("quiz_settings", {
  id: int("id").autoincrement().primaryKey(),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  questionCount: int("questionCount").default(25).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type StudentActivity = typeof studentActivities.$inferSelect;
export type InsertStudentActivity = typeof studentActivities.$inferInsert;
export type QuizSettings = typeof quizSettings.$inferSelect;
export type InsertQuizSettings = typeof quizSettings.$inferInsert;
