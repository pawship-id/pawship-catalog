import { ApiResponse } from "@/lib/types/api";

// basic data types for all Mongoose Models
interface BaseModel {
  _id: string; // Unique ID from MongoDB
}

/**
 * 1. retrieve all data (Read All)
 * @param url -> URL endpoint API (example: '/api/users')
 * @returns Array of data type T
 */
export async function getAll<T extends BaseModel>(
  url: string,
): Promise<ApiResponse<T[]>> {
  const response = await fetch(url, {
    cache: "no-store", // always take the latest data
  });

  if (!response.ok) {
    const errorBody: ApiResponse<T> = await response.json();

    throw new Error(errorBody.message || "Internal server error");
  }

  const result: ApiResponse<T[]> = await response.json();

  return result;
}

/**
 * 2. retrieving data by ID (Read One)
 * @param url -> URL endpoint API (example: '/api/users/id')
 * @param id -> Document ID
 * @returns Single data of type T
 */
export async function getById<T extends BaseModel>(
  url: string,
  id: string,
): Promise<ApiResponse<T>> {
  const response = await fetch(`${url}/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody: ApiResponse<T> = await response.json();

    throw new Error(errorBody.message || "Internal server error");
  }

  const result: ApiResponse<T> = await response.json();

  return result;
}

/**
 * 3. create new data (Create)
 * @param url -> URL endpoint API (example: '/api/users')
 * @param data -> Data to be sent (without _id)
 * @returns the newly created data is of type T
 */
export async function createData<T extends BaseModel, D>(
  url: string,
  data: D,
): Promise<ApiResponse<T>> {
  const isFormData = data instanceof FormData;

  const response = await fetch(url, {
    method: "POST",
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody: ApiResponse<T> = await response.json();
    throw new Error(errorBody.message || "Internal server error");
  }

  const result: ApiResponse<T> = await response.json();

  return result;
}

/**
 * 4. updating data (Update)
 * @param url -> URL endpoint API (example: '/api/users')
 * @param id -> ID of the document to be updated
 * @param data -> Data to be updated
 * @returns the updated data is of type T
 */
export async function updateData<T extends BaseModel, D>(
  url: string,
  id: string,
  data: Partial<D>,
): Promise<ApiResponse<T>> {
  const isFormData = data instanceof FormData;

  const response = await fetch(`${url}/${id}`, {
    method: "PUT",
    headers: isFormData ? {} : { "Content-Type": "application/json" },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody: ApiResponse<T> = await response.json();
    throw new Error(errorBody.message || "Internal server error");
  }

  const result: ApiResponse<T> = await response.json();
  return result;
}

/**
 * 5. delete data (Delete)
 * @param url -> URL endpoint API (example: '/api/users')
 * @param id -> ID of the document to be deleted
 */
export async function deleteById(url: string, id: string): Promise<void> {
  const response = await fetch(`${url}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message || "Internal server error");
  }
}
