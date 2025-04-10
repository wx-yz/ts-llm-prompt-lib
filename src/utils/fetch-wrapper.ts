import type { RequestInfo, RequestInit, Response } from 'node-fetch';

// Helper function to dynamically import node-fetch
let fetchModule: typeof import('node-fetch').default | null = null;

export async function fetchWrapper(
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> {
  if (!fetchModule) {
    // Dynamically import node-fetch
    const module = await import('node-fetch');
    fetchModule = module.default;
  }
  return fetchModule(url, init);
}