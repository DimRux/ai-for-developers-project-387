import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import type { components } from '@/shared/api/types';

type DaySlots = components['schemas']['DaySlots'];
type Slot = components['schemas']['Slot'];

interface SlotsCalendarProps {
  days: DaySlots[];
  onSelectSlot?: (slot: Slot) => void;
  selectedSlot?: Slot | null;
}

export function SlotsCalendar({ days, onSelectSlot, selectedSlot }: SlotsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedDay = days.find((d) => d.date === selectedDate);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const hasAvailable = day.slots.some((s) => s.isAvailable);
          return (
            <Button
              key={day.date}
              variant={selectedDate === day.date ? 'default' : 'outline'}
              size="sm"
              disabled={!hasAvailable}
              onClick={() => setSelectedDate(day.date)}
            >
              {new Date(day.date).getDate()}
            </Button>
          );
        })}
      </div>

      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {selectedDay.slots
                .filter((s) => s.isAvailable)
                .map((slot) => (
                  <Button
                    key={slot.start}
                    variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSelectSlot?.(slot)}
                  >
                    {new Date(slot.start).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
