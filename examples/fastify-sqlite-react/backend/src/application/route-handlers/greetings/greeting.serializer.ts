import type { Greeting } from '../../../domain/entities/greeting';
import type { GreetingListResponse, GreetingResponse } from './greeting.schema';

export const toGreetingResponse = (greeting: Greeting): GreetingResponse => ({
  id: String(greeting.id),
  message: greeting.message,
  language: greeting.language,
  createdAt: greeting.createdAt.toISOString(),
});

export const toGreetingListResponse = (greetings: Greeting[]): GreetingListResponse =>
  greetings.map(toGreetingResponse);
