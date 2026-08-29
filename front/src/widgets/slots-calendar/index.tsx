import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from '@/shared/ui';
import { CalendarXIcon, ClockIcon } from 'lucide-react';
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
  // Доступные слоты выбранного дня — только те, что не заняты (isAvailable)
  const availableSlots = selectedDay?.slots.filter((s) => s.isAvailable) ?? [];

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

      {days.length === 0 && (
        <EmptyState
          icon={CalendarXIcon}
          title="Нет доступных слотов"
          description="На данный момент нет дат для записи"
        />
      )}

      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <EmptyState
                icon={ClockIcon}
                title="Нет доступных слотов"
                description="В этот день нет свободного времени"
              />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
