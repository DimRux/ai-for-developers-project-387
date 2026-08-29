import { useParams, Link } from 'react-router-dom';
import { useBooking } from '@/entities/booking';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib';

export function BookingConfirmation() {
  const { bookingId = '' } = useParams();
  const { data: booking, isLoading } = useBooking(bookingId);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center">Бронирование не найдено</div>;
  }

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Бронирование подтверждено</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <span className="font-medium">Тип:</span> {booking.eventTypeTitle}
          </p>
          <p>
            <span className="font-medium">Гость:</span> {booking.guest.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {booking.guest.email}
          </p>
          <p>
            <span className="font-medium">Начало:</span> {formatDateTime(booking.start)}
          </p>
          <p>
            <span className="font-medium">Конец:</span> {formatDateTime(booking.end)}
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-2.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            На главную
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
