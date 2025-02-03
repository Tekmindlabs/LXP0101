import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewType, EventSchema } from '@/types/calendar';

interface CalendarContentProps {
	events: EventSchema[];
	view: ViewType;
	onEventClick: (event: EventSchema) => void;
}

function EventListView({ events, onEventClick }: { events: EventSchema[], onEventClick: (event: EventSchema) => void }) {
	return (
		<ScrollArea className="h-full">
			<div className="p-4 space-y-2">
				{events.map((event) => (
					<Card 
						key={event.id}
						className="p-4 cursor-pointer hover:bg-accent"
						onClick={() => onEventClick(event)}
					>
						<div className="flex justify-between">
							<div>
								<h3 className="font-medium">{event.title}</h3>
								<p className="text-sm text-muted-foreground">{event.description}</p>
							</div>
							<div className="text-sm text-muted-foreground">
								{new Date(event.startDate).toLocaleDateString()}
							</div>
						</div>
						<div className="mt-2 flex gap-2">
							{event.priority && (
								<span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
									{event.priority}
								</span>
							)}
							<span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">
								{event.eventType}
							</span>
						</div>
					</Card>
				))}
			</div>
		</ScrollArea>
	);
}

export function CalendarContent({ events, view, onEventClick }: CalendarContentProps) {
	if (view === 'list') {
		return <EventListView events={events} onEventClick={onEventClick} />;
	}

	return (
		<div className="p-4">
			<Calendar 
				mode="multiple"
				selected={events.map(event => new Date(event.startDate))}
				className="rounded-md border"
			/>
		</div>
	);
}