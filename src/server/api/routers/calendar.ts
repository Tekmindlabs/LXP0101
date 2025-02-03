import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { calendarService } from '@/lib/calendar/calendar-service';

const eventSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	eventType: z.string(),
	startDate: z.date(),
	endDate: z.date(),
	calendarId: z.string(),
	priority: z.string().optional(),
	visibility: z.string().optional(),
	metadata: z.record(z.any()).optional(),
	status: z.string().optional(),
	recurrence: z.object({
		frequency: z.string(),
		interval: z.number().optional(),
		endDate: z.date().optional(),
		count: z.number().optional(),
		daysOfWeek: z.array(z.number()).optional()
	}).optional()
});

export const calendarRouter = createTRPCRouter({
	getCalendars: protectedProcedure
		.input(z.object({
			type: z.string().optional(),
			status: z.string().optional(),
			visibility: z.string().optional(),
			dateRange: z.object({
				from: z.date(),
				to: z.date()
			}).optional()
		}))
		.query(({ input }) => {
			return calendarService.getCalendars(input);
		}),

	createCalendar: protectedProcedure
		.input(z.object({
			name: z.string(),
			type: z.string(),
			visibility: z.string().optional()
		}))
		.mutation(({ input }) => {
			return calendarService.createCalendar(input);
		}),

	getCalendarEvents: protectedProcedure
		.input(z.object({
			calendarId: z.string(),
			filters: z.object({
				status: z.string().optional(),
				visibility: z.string().optional(),
				dateRange: z.object({
					from: z.date(),
					to: z.date()
				}).optional()
			}).optional()
		}))
		.query(({ input }) => {
			return calendarService.getCalendarEvents(input.calendarId, input.filters);
		}),

	createEvent: protectedProcedure
		.input(eventSchema)
		.mutation(({ input }) => {
			return calendarService.createEvent(input);
		}),

	updateEvent: protectedProcedure
		.input(z.object({
			id: z.string(),
			data: eventSchema.partial()
		}))
		.mutation(({ input }) => {
			return calendarService.updateEvent(input.id, input.data);
		}),

	deleteEvent: protectedProcedure
		.input(z.string())
		.mutation(({ input }) => {
			return calendarService.deleteEvent(input);
		})
});
