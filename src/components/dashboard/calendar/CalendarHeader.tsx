import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { CalendarFilters, ViewType, CalendarType, Visibility } from '@/types/calendar';

interface CalendarHeaderProps {
	onViewChange: (view: ViewType) => void;
	onFiltersChange: (filters: CalendarFilters) => void;
	currentView: ViewType;
	currentFilters: CalendarFilters;
}

export function CalendarHeader({ onViewChange, onFiltersChange, currentView, currentFilters }: CalendarHeaderProps) {
	const handleViewToggle = (view: ViewType) => {
		onViewChange(view);
	};

	const handleFilterChange = (key: keyof CalendarFilters, value: any) => {
		onFiltersChange({ ...currentFilters, [key]: value });
	};

	return (
		<div className="flex items-center justify-between p-4 border-b">
			<div className="flex gap-2">
				<Button 
					variant={currentView === 'list' ? 'default' : 'outline'}
					onClick={() => handleViewToggle('list')}
				>
					List View
				</Button>
				<Button 
					variant={currentView === 'calendar' ? 'default' : 'outline'}
					onClick={() => handleViewToggle('calendar')}
				>
					Calendar View
				</Button>
			</div>
			
			<div className="flex gap-4">
				<Select
					value={currentFilters.type}
					onValueChange={(value) => handleFilterChange('type', value)}
					options={[
						{ value: 'master', label: 'Master' },
						{ value: 'class-group', label: 'Class Group' },
						{ value: 'class', label: 'Class' }
					]}
					placeholder="Calendar Type"
				/>
				
				<DateRangePicker
					value={currentFilters.dateRange}
					onChange={(range) => handleFilterChange('dateRange', range)}
				/>
				
				<Select
					value={currentFilters.visibility}
					onValueChange={(value) => handleFilterChange('visibility', value)}
					options={[
						{ value: 'public', label: 'Public' },
						{ value: 'private', label: 'Private' },
						{ value: 'restricted', label: 'Restricted' }
					]}
					placeholder="Visibility"
				/>
			</div>
		</div>
	);
}