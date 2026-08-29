import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui';
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
              {eventTypes.map((et) => (
                <TableRow key={et.id}>
                  <TableCell className="font-mono text-xs">{et.id}</TableCell>
                  <TableCell>{et.title}</TableCell>
                  <TableCell>{et.durationMinutes} мин</TableCell>
                  <TableCell>{formatDate(et.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
