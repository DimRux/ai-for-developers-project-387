import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type SlotsResponse = components['schemas']['SlotsResponse'];

async function listSlots(
  eventTypeId: string,
  params: {
    from?: string;
    to?: string;
    onlyAvailable?: boolean;
  } = {}
): Promise<SlotsResponse> {
  const { data } = await apiClient.get<SlotsResponse>(
    `/event-types/${encodeURIComponent(eventTypeId)}/slots`,
    { params: { onlyAvailable: true, ...params } }
  );
  return data;
}

export function useSlots(
  eventTypeId: string,
  params: {
    from?: string;
    to?: string;
    onlyAvailable?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: ['slots', eventTypeId, params],
    queryFn: () => listSlots(eventTypeId, params),
    enabled: !!eventTypeId,
  });
}
