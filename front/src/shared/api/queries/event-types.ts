import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type EventType = components['schemas']['EventType'];
type PageEventType = components['schemas']['PageEventType'];

async function listEventTypes(): Promise<EventType[]> {
  const { data } = await apiClient.get<EventType[]>('/event-types');
  return data;
}

async function listEventTypesPaginated(limit = 20, offset = 0): Promise<PageEventType> {
  const { data } = await apiClient.get<PageEventType>('/admin/event-types', {
    params: { limit, offset },
  });
  return data;
}

async function getEventType(eventTypeId: string): Promise<EventType> {
  const { data } = await apiClient.get<EventType>(
    `/event-types/${encodeURIComponent(eventTypeId)}`
  );
  return data;
}

export function usePublicEventTypes() {
  return useQuery({ queryKey: ['eventTypes', 'public'], queryFn: listEventTypes });
}

export function useAdminEventTypes(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['eventTypes', 'admin', limit, offset],
    queryFn: () => listEventTypesPaginated(limit, offset),
  });
}

export function useEventType(eventTypeId: string) {
  return useQuery({
    queryKey: ['eventTypes', eventTypeId],
    queryFn: () => getEventType(eventTypeId),
    enabled: !!eventTypeId,
  });
}
