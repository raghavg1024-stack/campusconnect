import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const events = sqliteTable('events', {
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),title:text('title').notNull(),description:text('description').notNull(),category:text('category').notNull(),club:text('club').notNull(),startsAt:text('starts_at').notNull(),location:text('location').notNull(),capacity:integer('capacity').notNull(),mode:text('mode').notNull(),status:text('status').notNull().default('published'),createdAt:text('created_at').notNull(),
});
export const registrations = sqliteTable('registrations', {
 id:text('id').primaryKey(),eventId:text('event_id').notNull().references(()=>events.id),userId:text('user_id').notNull(),name:text('name').notNull(),email:text('email').notNull(),checkedIn:integer('checked_in').notNull().default(0),createdAt:text('created_at').notNull(),
},t=>[uniqueIndex('registration_event_user').on(t.eventId,t.userId)]);
export const memberships = sqliteTable('memberships', {
 id:text('id').primaryKey(),clubId:text('club_id').notNull(),userId:text('user_id').notNull(),
},t=>[uniqueIndex('membership_club_user').on(t.clubId,t.userId)]);
