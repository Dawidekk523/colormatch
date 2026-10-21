import type { APIRoute } from 'astro';
import { llmsFullTxt } from '../lib/llms';

export const GET: APIRoute = ({ site }) =>
  new Response(llmsFullTxt(site!), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
