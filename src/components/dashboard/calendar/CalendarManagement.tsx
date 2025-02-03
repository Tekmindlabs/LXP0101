import { useState } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarContent } from './CalendarContent';
import { ViewType, CalendarFilters, EventSchema } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';

const defaultFilters: CalendarFilters = {
	type: undefined,
	status: 'active',
	dateRange: null,
	visibility: undefined
};

export function CalendarManagement() {
	const [view, setView] = useState<ViewType>('calendar');
	const [filters, setFilters] = useState<CalendarFilters>(defaultFilters);
	const [activeCalendarId, setActiveCalendarId] = useState<string | null>(null);
	const { toast } = useToast();

	// Mock data - Replace with actual API calls
	const calendars = [
		{ id: '1', name: 'Master Calendar', type: 'master' as const },
		{ id: '2', name: 'Class Group A', type: 'class-group' as const },
		{ id: '3', name: 'Class 101', type: 'class' as const }
	];

	const events: EventSchema[] = [
		{
			id: '1',
			title: 'Team Meeting',
			description: 'Weekly sync',
			eventType: 'class',
			startDate: new Date(),
			endDate: new Date(),
			calendarId: '1',
			priority: 'high'
		}
	];

	const handleEventClick = (event: EventSchema) => {
		toast({
			title: event.title,
			description: event.description
		});
	};

	const handleCreateCalendar = () => {
		toast({
			title: 'Create Calendar',
			description: 'Calendar creation modal will open here'
		});
	};

	return (
		<div className="h-screen flex flex-col">
			<CalendarHeader
				onViewChange={setView}
				onFiltersChange={setFilters}
				currentView={view}
				currentFilters={filters}
			/>
			<div className="flex-1 flex overflow-hidden">
				<CalendarSidebar
					calendars={calendars}
					activeCalendarId={activeCalendarId}
					onCalendarSelect={setActiveCalendarId}
					onCreateCalendar={handleCreateCalendar}
				/>
				<div className="flex-1">
					<CalendarContent
						events={events}
						view={view}
						onEventClick={handleEventClick}
					/>
				</div>
			</div>
		</div>
	);
}