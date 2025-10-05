import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc";
import { db } from "../db";
import { tasks } from "../db/schema/tasks";
import { employees } from "../db/schema/employees";
import { eq } from "drizzle-orm";

// --- Validation Schemas ---
const taskInput = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  assignedTo: z.string().uuid(),
  deadline: z.string().datetime().optional(),
});

const updateTaskInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in-progress", "done"]),
});

// --- Router ---
export const tasksRouter = router({
  // ✅ Create a new task (Manager only)
  createTask: protectedProcedure
    .input(taskInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.email, ctx.user.email))
        .limit(1);

      if (!employee.length || employee[0].role !== "manager") {
        throw new Error("Unauthorized");
      }

      await db.insert(tasks).values({
        title: input.title,
        description: input.description,
        assignedTo: input.assignedTo,
        deadline: input.deadline ? new Date(input.deadline) : null,
      });

      return { success: true };
    }),

  // ✅ Fetch all tasks (Manager → all | Employee → only theirs)
  getTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");

    const employee = await db
      .select()
      .from(employees)
      .where(eq(employees.email, ctx.user.email))
      .limit(1);

    if (!employee.length) throw new Error("Employee not found");

    if (employee[0].role === "manager") {
      return await db.select().from(tasks);
    } else {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.assignedTo, employee[0].id));
    }
  }),

  // ✅ Update task status (Employee only)
  updateStatus: protectedProcedure
    .input(updateTaskInput)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.email, ctx.user.email))
        .limit(1);

      if (!employee.length || employee[0].role !== "employee") {
        throw new Error("Unauthorized");
      }

      await db
        .update(tasks)
        .set({ status: input.status })
        .where(eq(tasks.id, input.id));

      return { success: true };
    }),

  // ✅ Delete task (Manager only)
  deleteTask: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const employee = await db
        .select()
        .from(employees)
        .where(eq(employees.email, ctx.user.email))
        .limit(1);

      if (!employee.length || employee[0].role !== "manager") {
        throw new Error("Unauthorized");
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
