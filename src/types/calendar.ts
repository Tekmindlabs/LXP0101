export type CalendarType = 'master' | 'class-group' | 'class';
export type Status = 'active' | 'draft' | 'archived';
export type Visibility = 'public' | 'private' | 'restricted';
export type Priority = 'high' | 'medium' | 'low';
export type EventType = 'class' | 'assignment' | 'exam' | 'holiday' | 'other';
export type ViewType = 'list' | 'calendar';

export interface CalendarFilters {
	type?: CalendarType;
	status?: Status;
	dateRange?: { from: Date; to: Date } | null;
	visibility?: Visibility;
}

export interface EventSchema {
	id: string;
	title: string;
	description?: string;
	eventType: EventType;
	startDate: Date;
	endDate: Date;
	calendarId: string;
	priority?: Priority;
	visibility?: Visibility;
	recurrence?: RecurrenceRule;
	metadata?: Record<string, any>;
	status?: Status;
}

export interface RecurrenceRule {
	frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
	interval?: number;
	endDate?: Date;
	count?: number;
	daysOfWeek?: number[];
}

export interface ViewState {
	view: ViewType;
	filters: CalendarFilters;
	activeCalendarId: string | null;
}