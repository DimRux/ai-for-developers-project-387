import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type Booking = components['schemas']['Booking'];
type PageBooking = components['schemas']['PageBooking'];

async function listBookings(params: {
  limit?: number;
  offset?: number;
  scope?: 'upcoming' | 'past' | 'all';
  eventTypeId?: string;
  from?: string;
  to?: string;
}): Promise<PageBooking> {
  const { data } = await apiClient.get<PageBooking>('/admin/bookings', {
    params: { limit: 20, offset: 0, ...params },
  });
  return data;
}

async function getBooking(bookingId: string): Promise<Booking> {
  const { data } = await apiClient.get<Booking>(`/bookings/${encodeURIComponent(bookingId)}`);
  return data;
}

export function useBookings(
  params: {
    limit?: number;
    offset?: number;
    scope?: 'upcoming' | 'past' | 'all';
    eventTypeId?: string;
    from?: string;
    to?: string;
  } = {}
) {
  return useQuery({
    queryKey: ['bookings', 'admin', params],
    queryFn: () => listBookings(params),
  });
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: !!bookingId,
  });
}
