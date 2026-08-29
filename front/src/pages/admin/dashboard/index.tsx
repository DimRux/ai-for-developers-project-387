import { useBookings } from '@/entities/booking';
import { useBookingFilters } from '@/features/filter-bookings';
import { BookingsTable } from '@/widgets/bookings-table';

export function Dashboard() {
  const { scope, eventTypeId, setScope, setEventTypeId } = useBookingFilters();
  const { data, isLoading } = useBookings({ scope, eventTypeId });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">Встречи</h1>

      <div className="flex gap-4">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="upcoming">Предстоящие</option>
          <option value="past">Прошедшие</option>
          <option value="all">Все</option>
        </select>

        <input
          type="text"
          placeholder="Фильтр по типу события"
          value={eventTypeId ?? ''}
          onChange={(e) => setEventTypeId(e.target.value || undefined)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {data && <BookingsTable bookings={data.items} />}
    </div>
  );
}
