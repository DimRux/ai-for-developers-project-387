import { useState } from 'react';
import type { components } from '@/shared/api/types';

type BookingScope = components['schemas']['BookingScope'];

export function useBookingFilters() {
  const [scope, setScope] = useState<BookingScope>('upcoming');
  const [eventTypeId, setEventTypeId] = useState<string | undefined>(undefined);

  return {
    scope,
    eventTypeId,
    setScope,
    setEventTypeId,
  };
}
