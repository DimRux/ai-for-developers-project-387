import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui';
import { CalendarPlusIcon } from 'lucide-react';
import { formatDate } from '@/shared/lib';
import type { components } from '@/shared/api/types';

type EventType = components['schemas']['EventType'];

interface EventTypesListProps {
  eventTypes: EventType[];
  onAdd?: () => void;
}

export function EventTypesList({ eventTypes, onAdd }: EventTypesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Типы событий</h2>
        <Button onClick={onAdd}>Добавить</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Создано</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 whitespace-normal p-0">
                    <EmptyState
                      icon={CalendarPlusIcon}
                      title="Пока нет типов событий"
                      description="Создайте первый тип события, чтобы начать принимать записи"
                      action={
                        <Button variant="outline" size="sm" onClick={onAdd} className="mt-2">
                          Добавить тип события
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                eventTypes.map((et) => (
                  <TableRow key={et.id}>
                    <TableCell className="font-mono text-xs">{et.id}</TableCell>
                    <TableCell>{et.title}</TableCell>
                    <TableCell>{et.durationMinutes} мин</TableCell>
                    <TableCell>{formatDate(et.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
