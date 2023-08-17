import { relations } from 'drizzle-orm'
import { text, pgTable, primaryKey } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

/**
 * tables
 */

export const user = pgTable('user', {
  id: text('cuid').primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  householdId: text('household_id').references(() => household.id),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const household = pgTable('household', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const area = pgTable('area', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  householdId: text('household_id').references(() => household.id),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const chore = pgTable('chore', {
  id: text('cuid').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  householdId: text('household_id').references(() => household.id),
  createdAt: text('created_at').default(new Date().toISOString()),
  updatedAt: text('updated_at').default(new Date().toISOString())
})

export const session = pgTable('session', {
  id: text('cuid').primaryKey(),
  userId: text('user_id').references(() => user.id),
  expiresAt: text('expires_at')
})

export const areasToChores = pgTable(
  'areas_to_chores',
  {
    areaId: text('area_cuid').references(() => area.id),
    choreId: text('chore_id').references(() => chore.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString())
  },
  (t) => ({
    id: primaryKey(t.areaId, t.choreId)
  })
)

export const usersToChores = pgTable(
  'users_to_chores',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    choreId: text('chore_id')
      .notNull()
      .references(() => chore.id),
    createdAt: text('created_at').default(new Date().toISOString()),
    updatedAt: text('updated_at').default(new Date().toISOString())
  },
  (t) => ({
    pk: primaryKey(t.userId, t.choreId)
  })
)

/**
 * relations
 */

export const usersRelations = relations(user, ({ one, many }) => ({
  household: one(household, {
    references: [household.id],
    fields: [user.householdId]
  }),
  usersToChores: many(usersToChores)
}))

export const householdRelations = relations(household, ({ many }) => ({
  users: many(user),
  areas: many(area)
}))

export const areaRelation = relations(area, ({ one, many }) => ({
  household: one(household, {
    fields: [area.householdId],
    references: [household.id]
  }),
  areasToChores: many(areasToChores)
}))

export const areasToChoresRelations = relations(areasToChores, ({ one }) => ({
  chore: one(area, {
    fields: [areasToChores.areaId],
    references: [area.id]
  }),
  user: one(chore, {
    fields: [areasToChores.choreId],
    references: [chore.id]
  })
}))

export const choreRelations = relations(chore, ({ many, one }) => ({
  usersToChores: many(usersToChores),
  household: one(household, {
    fields: [chore.householdId],
    references: [household.id]
  }),
  areasToChores: many(areasToChores)
}))

export const usersToChoresRelation = relations(usersToChores, ({ one }) => ({
  chore: one(chore, {
    fields: [usersToChores.choreId],
    references: [chore.id]
  }),
  user: one(user, {
    fields: [usersToChores.userId],
    references: [user.id]
  })
}))

/**
 * schemas
 */

export const insertUserSchema = createInsertSchema(user, {
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

export const insertHouseholdSchema = createInsertSchema(household, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters')
})

export const insertAreaSchema = createInsertSchema(area, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters')
})

export const insertChoreSchema = createInsertSchema(chore, {
  id: (schema) => schema.id.optional(),
  name: (schema) =>
    schema.name
      .min(1, 'Name must be more than 1 character')
      .max(50, 'Name must be less than 50 characters'),
  description: (schema) =>
    schema.description.max(50, 'Description must be less than 50 characters')
})

export const insertHouseholdAreaAndChoreSchema = z.object({
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
