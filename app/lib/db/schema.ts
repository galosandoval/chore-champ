import { relations } from 'drizzle-orm'
import { text, pgTable, primaryKey, pgEnum } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

/**
 * tables
 */

export const users = pgTable('users', {
  id: text('cuid').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  householdId: text('household_id').references(() => households.id),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    references: [households.id],
    fields: [users.householdId]
  }),
  usersToChores: many(usersToChores)
}))

export const households = pgTable('households', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const householdRelations = relations(households, ({ many }) => ({
  users: many(users),
  areas: many(areas)
}))

export const areas = pgTable('areas', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  householdId: text('household_id').references(() => households.id),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const areasRelations = relations(areas, ({ one, many }) => ({
  household: one(households, {
    fields: [areas.householdId],
    references: [households.id]
  }),
  areasToChores: many(areasToChores)
}))

export const frequencyEnum = pgEnum('frequency', [
  'daily',
  'weekly',
  'bi-weekly',
  'monthly',
  'custom'
])

export const chores = pgTable('chores', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dueAt: text('due_at'),
  frequency: frequencyEnum('frequency'),
  customFrequency: text('custom_frequency'),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const choresRelations = relations(chores, ({ many }) => ({
  usersToChores: many(usersToChores),

  areasToChores: many(areasToChores)
}))

export const sessions = pgTable('sessions', {
  id: text('cuid').primaryKey(),
  userId: text('user_id').references(() => users.id),
  expiresAt: text('expires_at')
})

export const areasToChores = pgTable(
  'areas_to_chores',
  {
    areaId: text('area_id').references(() => areas.id),
    choreId: text('chore_id').references(() => chores.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString())
  },
  (t) => ({
    pk: primaryKey(t.areaId, t.choreId)
  })
)

export const areasToChoresRelations = relations(areasToChores, ({ one }) => ({
  chore: one(areas, {
    fields: [areasToChores.areaId],
    references: [areas.id]
  }),
  area: one(chores, {
    fields: [areasToChores.choreId],
    references: [chores.id]
  })
}))

export const usersToChores = pgTable(
  'users_to_chores',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    choreId: text('chore_id')
      .notNull()
      .references(() => chores.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString())
  },
  (t) => ({
    pk: primaryKey(t.userId, t.choreId)
  })
)

export const usersToChoresRelations = relations(usersToChores, ({ one }) => ({
  chore: one(chores, {
    fields: [usersToChores.choreId],
    references: [chores.id]
  }),
  user: one(users, {
    fields: [usersToChores.userId],
    references: [users.id]
  })
}))

/**
 * schemas
 */

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  password: (schema) => schema.password.min(8).max(50),
  id: (schema) => schema.id.optional()
})

export const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(8).max(50)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

export type User = z.infer<typeof insertUserSchema>

export const insertHouseholdSchema = createInsertSchema(households, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters')
})

export const insertAreaSchema = createInsertSchema(areas, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters')
})

export const insertChoreSchema = createInsertSchema(chores, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters'),
  description: (schema) =>
    schema.description.max(50, 'Description must be less than 50 characters')
})

export const insertHouseholdsAreasAndChoresSchema = z.object({
  householdName: z
    .string()
    .min(1, 'Name must be more than 1 character')
    .max(50, 'Name must be less than 50 characters'),
  areaNames: z
    .string()
    .min(1, 'Name must be more than 1 character')
    .max(50, 'Name must be less than 50 characters')
    .array(),
  choreNames: z
    .string()
    .min(1, 'Name must be more than 1 character')
    .max(50, 'Name must be less than 50 characters')
    .array()
})
