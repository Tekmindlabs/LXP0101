import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CalendarType } from '@/types/calendar';

interface Calendar {
	id: string;
	name: string;
	type: CalendarType;
}

interface CalendarSidebarProps {
	calendars: Calendar[];
	activeCalendarId: string | null;
	onCalendarSelect: (calendarId: string) => void;
	onCreateCalendar?: () => void;
}

export function CalendarSidebar({ 
	calendars, 
	activeCalendarId, 
	onCalendarSelect,
	onCreateCalendar 
}: CalendarSidebarProps) {
	return (
		<div className="w-64 border-r h-full flex flex-col">
			<div className="p-4 border-b">
				<Button 
					className="w-full"
					onClick={onCreateCalendar}
				>
					Create Calendar
				</Button>
			</div>
			
			<ScrollArea className="flex-1">
				<div className="p-4 space-y-2">
					{calendars.map((calendar) => (
						<Button
							key={calendar.id}
							variant={activeCalendarId === calendar.id ? 'default' : 'ghost'}
							className="w-full justify-start"
							onClick={() => onCalendarSelect(calendar.id)}
						>
							<div className="flex flex-col items-start">
								<span>{calendar.name}</span>
								<span className="text-xs text-muted-foreground">
									{calendar.type}
								</span>
							</div>
						</Button>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}