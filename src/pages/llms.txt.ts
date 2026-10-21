import type { APIRoute } from 'astro';
import { llmsTxt } from '../lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsTxt(site!), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
