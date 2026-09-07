import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getQuizSettings, listRecentStudentActivities, recordStudentActivity, updateQuizSettings } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  student: router({
    quizSettings: publicProcedure.query(() => getQuizSettings()),
    heartbeat: publicProcedure.input(z.object({
      studentName: z.string().min(2).max(160),
      className: z.string().min(1).max(32),
      activityType: z.string().min(1).max(48),
      activityLabel: z.string().min(1).max(180),
      progress: z.number().int().min(0).max(100).default(0),
      score: z.number().int().min(0).max(100).nullable().optional(),
    })).mutation(async ({ input }) => {
      await recordStudentActivity({ ...input, score: input.score ?? null, isOnline: 1 });
      return { ok: true } as const;
    }),
  }),
  teacher: router({
    quizSettings: adminProcedure.query(() => getQuizSettings()),
    updateQuizSettings: adminProcedure.input(z.object({
      durationMinutes: z.number().int().min(5).max(120),
      questionCount: z.number().int().min(5).max(25),
    })).mutation(({ input }) => updateQuizSettings(input.durationMinutes, input.questionCount)),
    liveOverview: adminProcedure.query(async () => {
      const activities = await listRecentStudentActivities();
      const latestByStudent = new Map<string, typeof activities[number]>();
      const quizHistoryByStudent = new Map<string, typeof activities>();
      activities.forEach((activity) => {
        const key = `${activity.studentName}::${activity.className}`;
        if (!latestByStudent.has(key)) latestByStudent.set(key, activity);
        if (activity.activityType === "quiz" && activity.score !== null) {
          const history = quizHistoryByStudent.get(key) ?? [];
          history.push(activity);
          quizHistoryByStudent.set(key, history);
        }
      });
      const cutoff = Date.now() - 45_000;
      const students = Array.from(latestByStudent.entries()).map(([key, activity]) => ({
        ...activity,
        isOnline: new Date(activity.lastSeenAt).getTime() >= cutoff ? 1 : 0,
        quizHistory: (quizHistoryByStudent.get(key) ?? []).slice(0, 20).map((quiz) => ({
          id: quiz.id,
          score: quiz.score,
          activityLabel: quiz.activityLabel,
          completedAt: quiz.createdAt,
        })),
      }));
      return {
        students,
        totals: {
          active: students.filter((student) => student.isOnline === 1).length,
          tracked: students.length,
          averageProgress: students.length ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length) : 0,
        },
        refreshedAt: new Date().toISOString(),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
