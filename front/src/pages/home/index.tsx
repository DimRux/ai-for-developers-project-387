import { useNavigate } from 'react-router-dom';
import { usePublicEventTypes } from '@/entities/event-type';
import { EventTypeCard } from '@/widgets/event-type-card';

export function Home() {
  const { data: eventTypes, isLoading } = usePublicEventTypes();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold">Выберите вид встречи</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {eventTypes?.map((et) => (
          <EventTypeCard
            key={et.id}
            eventType={et}
            onSelect={(id) => navigate(`/event-types/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}
