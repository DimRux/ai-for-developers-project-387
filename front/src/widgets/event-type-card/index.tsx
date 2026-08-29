import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { formatDate } from '@/shared/lib';
import type { components } from '@/shared/api/types';

type EventType = components['schemas']['EventType'];

interface EventTypeCardProps {
  eventType: EventType;
  onSelect?: (eventTypeId: string) => void;
}

export function EventTypeCard({ eventType, onSelect }: EventTypeCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent"
      onClick={() => onSelect?.(eventType.id)}
    >
      <CardHeader>
        <CardTitle>{eventType.title}</CardTitle>
        <CardDescription>{eventType.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{eventType.durationMinutes} мин</p>
        <p className="text-xs text-muted-foreground">Создано: {formatDate(eventType.createdAt)}</p>
      </CardContent>
    </Card>
  );
}
