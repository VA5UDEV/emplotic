import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { employees } from "./employees";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending | in-progress | done
  assignedTo: uuid("assigned_to").references(() => employees.id),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow(),
});
