import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type Booking = components['schemas']['Booking'];
type BookingCreate = components['schemas']['BookingCreate'];

async function createBooking(eventTypeId: string, payload: BookingCreate): Promise<Booking> {
  const { data } = await apiClient.post<Booking>(
    `/event-types/${encodeURIComponent(eventTypeId)}/bookings`,
    payload
  );
  return data;
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: ({ eventTypeId, payload }: { eventTypeId: string; payload: BookingCreate }) =>
      createBooking(eventTypeId, payload),
  });
}
