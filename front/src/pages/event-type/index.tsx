import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventType } from '@/entities/event-type';
import { useSlots } from '@/entities/slot';
import { useCreateBooking } from '@/features/create-booking';
import { SlotsCalendar } from '@/widgets/slots-calendar';
import { BookingForm } from '@/widgets/booking-form';
import type { components } from '@/shared/api/types';
import { ApiRequestError } from '@/shared/api/client';

type Slot = components['schemas']['Slot'];

export function EventTypePage() {
  const { eventTypeId = '' } = useParams();
  const navigate = useNavigate();
  const { data: eventType, isLoading: loadingType } = useEventType(eventTypeId);
  const { data: slotsData, isLoading: loadingSlots, refetch: refetchSlots } = useSlots(eventTypeId);
  const createBooking = useCreateBooking();
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  if (loadingType || loadingSlots) {
    return <div className="p-8 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!eventType) {
    return <div className="p-8 text-center">Тип события не найден</div>;
  }

  const handleSubmit = (guest: components['schemas']['Guest']) => {
    if (!selectedSlot) return;
    setBookingError(null);

    createBooking.mutate(
      {
        eventTypeId,
        payload: { start: selectedSlot.start, guest },
      },
      {
        onSuccess: (booking) => {
          navigate(`/bookings/${booking.id}`);
        },
        onError: (error) => {
          if (error instanceof ApiRequestError) {
            switch (error.code) {
              case 'SLOT_TAKEN':
                setBookingError('Этот слот только что заняли. Выберите другой.');
                setSelectedSlot(null);
                refetchSlots();
                break;
              case 'SLOT_OUT_OF_WINDOW':
                setBookingError('Выбранное время вне окна записи.');
                break;
              case 'SLOT_NOT_ALIGNED':
                setBookingError('Выбранное время не попадает в сетку слотов.');
                break;
              case 'VALIDATION_ERROR':
                setBookingError(error.message);
                break;
              default:
                setBookingError('Произошла ошибка при бронировании.');
            }
          } else {
            setBookingError('Произошла ошибка при бронировании.');
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold">{eventType.title}</h1>
        <p className="text-muted-foreground">{eventType.description}</p>
        <p className="text-sm text-muted-foreground">{eventType.durationMinutes} мин</p>
      </div>

      {bookingError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {bookingError}
        </div>
      )}

      {slotsData && (
        <SlotsCalendar
          days={slotsData.days}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />
      )}

      <BookingForm
        slot={selectedSlot}
        onSubmit={handleSubmit}
        isPending={createBooking.isPending}
      />
    </div>
  );
}
