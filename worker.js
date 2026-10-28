// MOFU Cloudflare Worker: Google Sheets CSV proxy + static assets.
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQ_60RGTZ6lUOkukmHeH7vHopLRljD-iFoZHVW-9TlqEydrfaR3Q1De5psmdfMqm_f17OpXl1MaHXC/pub?gid=1214441936&single=true&output=csv';
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sheet') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', {status: 405});
      }
      try {
        const upstream = await fetch(SHEET_URL, {
          headers: {'Accept': 'text/csv,text/plain;q=0.9,*/*;q=0.5'},
          redirect: 'follow',
          cf: {cacheTtl: 60, cacheEverything: true}
        });
        if (!upstream.ok) {
          return new Response('Google Sheet HTTP ' + upstream.status, {status: 502, headers: {'Content-Type':'text/plain;charset=utf-8'}});
        }
        const body = await upstream.text();
        if (/^\s*(?:<!doctype html|<html)/i.test(body)) {
          return new Response('Google Sheet returned HTML instead of CSV', {status: 502, headers: {'Content-Type':'text/plain;charset=utf-8'}});
        }
        return new Response(request.method === 'HEAD' ? null : body, {status: 200, headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Cache-Control': 'public, max-age=60',
          'X-Content-Type-Options': 'nosniff'
        }});
      } catch (error) {
        return new Response('Unable to retrieve Google Sheet: ' + String(error), {status:502, headers:{'Content-Type':'text/plain;charset=utf-8'}});
      }
    }
    return env.ASSETS.fetch(request);
  }
};
