import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { employees } from "./employees";

export const surveys = pgTable("surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id").references(() => employees.id),
  response: text("response").notNull(),
  sentiment: text("sentiment"), // analyzed via AI
  createdAt: timestamp("created_at").defaultNow(),
});
