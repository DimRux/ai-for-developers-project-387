import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui';
import { formatDateTime } from '@/shared/lib';
import type { components } from '@/shared/api/types';

type Booking = components['schemas']['Booking'];

interface BookingsTableProps {
  bookings: Booking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Встречи</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тип события</TableHead>
              <TableHead>Гость</TableHead>
              <TableHead>Начало</TableHead>
              <TableHead>Конец</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.eventTypeTitle}</TableCell>
                <TableCell>{b.guest.name}</TableCell>
                <TableCell>{formatDateTime(b.start)}</TableCell>
                <TableCell>{formatDateTime(b.end)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
