import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("employee"), // "employee" | "manager"
  createdAt: timestamp("created_at").defaultNow(),
});
