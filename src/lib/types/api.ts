/**
 * generic Interface for API Responses
 * using type T for the 'data' property.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}
