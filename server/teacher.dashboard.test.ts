import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type TestUser = NonNullable<TrpcContext["user"]>;

function contextFor(role: TestUser["role"]): TrpcContext {
  const now = new Date();
  const user: TestUser = {
    id: role === "admin" ? 1 : 2,
    openId: `teacher-test-${role}`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Guru Admin" : "Siswa",
    loginMethod: "test",
    role,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("teacher.liveOverview", () => {
  it("rejects non-admin users before reading monitoring data", async () => {
    const caller = appRouter.createCaller(contextFor("user"));
    await expect(caller.teacher.liveOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exposes a protected monitoring procedure for admin users", () => {
    const caller = appRouter.createCaller(contextFor("admin"));
    expect(caller.teacher.liveOverview).toBeTypeOf("function");
  });
});
