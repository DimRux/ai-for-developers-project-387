import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { components } from '@/shared/api/types';

type Owner = components['schemas']['Owner'];

async function getOwner(): Promise<Owner> {
  const { data } = await apiClient.get<Owner>('/admin/owner');
  return data;
}

export function useOwner() {
  return useQuery({ queryKey: ['owner'], queryFn: getOwner });
}
