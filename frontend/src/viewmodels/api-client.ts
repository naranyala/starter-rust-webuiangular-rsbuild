// frontend/src/viewmodels/api-client.ts
// API client for backend communication using "errors as values" pattern
//
// This client demonstrates how to:
// 1. Call backend functions and handle structured errors
// 2. Convert API responses to Result types
// 3. Propagate errors as values through the application

import type { User, UserCreatePayload, UserUpdatePayload } from '../models/user.model';
import { ApiResponse, ErrorCode, ErrorValue, Result } from '../types/error.types';
import { getLogger } from './logger';

const logger = getLogger('api-client');

/**
 * Call a backend function and return a typed Result
 */
export async function callBackend<T>(functionName: string, ...args: unknown[]): Promise<Result<T>> {
  return new Promise<Result<T>>((resolve) => {
    const responseEventName = getResponseEventName(functionName);

    const handler = (event: Event) => {
      clearTimeout(timeoutId);
      window.removeEventListener(responseEventName, handler as EventListener);

      const customEvent = event as CustomEvent;
      const response: ApiResponse | undefined = customEvent.detail?.response;

      if (response?.success && response.data !== undefined) {
        logger.debug(`Backend call success: ${functionName}`);
        resolve({ success: true, value: response.data as T });
      } else {
        const errorValue: ErrorValue = {
          code: (response?.error?.code as ErrorCode) || ErrorCode.InternalError,
          message: response?.error?.message || `Backend call failed: ${functionName}`,
          details: response?.error?.details,
        };
        logger.error(`Backend call failed: ${functionName}`, {}, new Error(errorValue.message));
        resolve({ success: false, error: errorValue });
      }
    };

    const timeoutId = setTimeout(() => {
      window.removeEventListener(responseEventName, handler as EventListener);
      logger.error(`Backend call timeout: ${functionName}`);
      resolve({
        success: false,
        error: {
          code: ErrorCode.InternalError,
          message: `Backend call timeout: ${functionName}`,
          details: 'No response received within timeout period',
        },
      });
    }, 30000);

    window.addEventListener(responseEventName, handler as EventListener, { once: true });

    try {
      const backendFn = (window as unknown as Record<string, unknown>)[functionName];

      if (typeof backendFn !== 'function') {
        clearTimeout(timeoutId);
        window.removeEventListener(responseEventName, handler as EventListener);
        logger.error(`Backend function not found: ${functionName}`);
        resolve({
          success: false,
          error: {
            code: ErrorCode.InternalError,
            message: `Backend function not found: ${functionName}`,
            details: 'The function is not bound or available',
          },
        });
        return;
      }

      backendFn(...args);
      logger.debug(`Backend call initiated: ${functionName}`);
    } catch (error) {
      clearTimeout(timeoutId);
      window.removeEventListener(responseEventName, handler as EventListener);
      logger.error(`Backend call failed: ${functionName}`, { error: String(error) });
      resolve({
        success: false,
        error: {
          code: ErrorCode.InternalError,
          message: `Failed to call backend: ${functionName}`,
          cause: error instanceof Error ? error.message : String(error),
        },
      });
    }
  });
}

function getResponseEventName(functionName: string): string {
  const eventMap: Record<string, string> = {
    get_users: 'db_response',
    create_user: 'user_create_response',
    update_user: 'user_update_response',
    delete_user: 'user_delete_response',
    get_system_info: 'sysinfo_response',
  };

  return eventMap[functionName] || `${functionName}_response`;
}

/**
 * User API functions
 */
export type { User, UserCreatePayload, UserUpdatePayload } from '../models/user.model';

export async function getUsers(): Promise<Result<User[]>> {
  return callBackend<User[]>('get_users');
}

export async function createUser(payload: UserCreatePayload): Promise<Result<number>> {
  const elementName = `create_user:${payload.name}:${payload.email}:${payload.role ?? 'User'}:${payload.status ?? 'Active'}`;
  return callBackend<number>('create_user', elementName);
}

export async function updateUser(payload: UserUpdatePayload): Promise<Result<number>> {
  const elementName = `update_user:${payload.id}:${payload.name ?? ''}:${payload.email ?? ''}:${payload.role ?? ''}:${payload.status ?? ''}`;
  return callBackend<number>('update_user', elementName);
}

export async function deleteUser(id: number): Promise<Result<number>> {
  const elementName = `delete_user:${id}`;
  return callBackend<number>('delete_user', elementName);
}

export async function getSystemInfo(): Promise<Result<Record<string, unknown>>> {
  return callBackend<Record<string, unknown>>('get_system_info');
}
