import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type EventType = components['schemas']['EventType'];
type EventTypeCreate = components['schemas']['EventTypeCreate'];

async function createEventType(payload: EventTypeCreate): Promise<EventType> {
  const { data } = await apiClient.post<EventType>('/admin/event-types', payload);
  return data;
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventTypes'] });
    },
  });
}
