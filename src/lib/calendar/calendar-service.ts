import { prisma } from '@/server/db';
import { EventSchema, CalendarFilters } from '@/types/calendar';
import { eventRouter } from './event-router';

export class CalendarService {
	async getCalendars(filters?: CalendarFilters) {
		const where = {
			...(filters?.type && { type: filters.type }),
			...(filters?.status && { status: filters.status }),
			...(filters?.visibility && { visibility: filters.visibility })
		};

		return prisma.calendar.findMany({
			where,
			include: {
				events: true
			}
		});
	}

	async createCalendar(data: { name: string; type: string; visibility?: string }) {
		return prisma.calendar.create({
			data: {
				...data,
				status: 'active'
			}
		});
	}

	async getCalendarEvents(calendarId: string, filters?: CalendarFilters) {
		const where = {
			calendarId,
			...(filters?.status && { status: filters.status }),
			...(filters?.visibility && { visibility: filters.visibility }),
			...(filters?.dateRange && {
				startDate: {
					gte: filters.dateRange.from
				},
				endDate: {
					lte: filters.dateRange.to
				}
			})
		};

		return prisma.event.findMany({ where });
	}

	async createEvent(data: Omit<EventSchema, 'id'>) {
		const event = await prisma.event.create({
			data: {
				...data,
				metadata: data.metadata || {}
			}
		});

		if (data.recurrence) {
			await prisma.recurringEvent.create({
				data: {
					eventId: event.id,
					frequency: data.recurrence.frequency,
					interval: data.recurrence.interval || 1,
					endDate: data.recurrence.endDate,
					count: data.recurrence.count,
					daysOfWeek: data.recurrence.daysOfWeek || []
				}
			});
		}

		return event;
	}

	async updateEvent(eventId: string, data: Partial<EventSchema>) {
		return prisma.event.update({
			where: { id: eventId },
			data
		});
	}

	async deleteEvent(eventId: string) {
		await prisma.recurringEvent.deleteMany({
			where: { eventId }
		});
		
		return prisma.event.delete({
			where: { id: eventId }
		});
	}
}

export const calendarService = new CalendarService();