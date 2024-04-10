import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from '../../api/spotify/callback/$types';
import { serialize } from 'cookie';

function encodeClientCredentials(clientId: string, clientSecret: string) {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return error(400, "Authorization code must be provided");
  }
    
  const clientId = 'e109cac1f5b144a083eba28c6550e4e2';
  const clientSecret = 'eaa8f33e99314f4287e2adacb9a98b9c';
  const redirectUri = 'http://localhost:5173/api/spotify/callback';
  
  // TODO: put in env variables
   
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodeClientCredentials(clientId, clientSecret)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  if (!response.ok) {
    const message = await response.text();
    return error(response.status, message);
  }
    
  const data = await response.json();
   
  
    
  // At this point, data contains the access token, refresh token, scope, and expires_in
  // You can redirect the user to a new page or handle the tokens as needed by your application
    
        
  console.log("refrle", data);

  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `spotifyToken=${JSON.stringify(data)}}; Path=/workspace; HttpOnly; Secure; Max-Age=3600`,

      Location: '/workspace',
    },
  });
  
}