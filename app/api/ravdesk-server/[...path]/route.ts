import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const TARGET_ORIGIN = 'https://ravdesk-server.vercel.app';

function buildTargetUrl(req: NextRequest, path: string[] | string | undefined) {
  const pathPart = Array.isArray(path) ? path.join('/') : (path || '');
  const { search } = new URL(req.url);
  // Ensure no double slashes
  const base = TARGET_ORIGIN.endsWith('/') ? TARGET_ORIGIN.slice(0, -1) : TARGET_ORIGIN;
  const suffix = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return `${base}${suffix}${search}`;
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path?: string[] | string }> }) {
  const { path } = await ctx.params;
  const url = buildTargetUrl(req, path);

  // Copy headers but drop hop-by-hop / problematic ones
  const incomingHeaders = new Headers(req.headers);
  const headers = new Headers();
  for (const [k, v] of incomingHeaders.entries()) {
    const lower = k.toLowerCase();
    if (['host', 'connection', 'content-length'].includes(lower)) continue;
    headers.set(k, v);
  }

  const method = req.method;
  const hasBody = method !== 'GET' && method !== 'HEAD';
  const body = hasBody ? Buffer.from(await req.arrayBuffer()) : undefined;

  const resp = await fetch(url, {
    method,
    headers,
    body: body as any,
  });

  // Pass through response
  const respHeaders = new Headers(resp.headers);
  // Make sure browser accepts the response in dev
  respHeaders.set('Access-Control-Allow-Origin', '*');
  respHeaders.set('Access-Control-Expose-Headers', '*');

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: respHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  return proxy(req, ctx);
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
