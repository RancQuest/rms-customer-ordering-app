import { publicApi } from './client';
import type { CreateOrderRequest, CreateOrderResponse } from '@/types/order';

export async function createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
  const { data } = await publicApi.post<CreateOrderResponse>('/api/orders', request);
  return data;
}
