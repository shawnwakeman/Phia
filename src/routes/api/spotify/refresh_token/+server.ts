import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { refreshToken } = await request.json();
  const clientId = 'e109cac1f5b144a083eba28c6550e4e2';
  const clientSecret = 'eaa8f33e99314f4287e2adacb9a98b9c';
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Create a Response object with the JSON data and status code
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Assuming the error is an instance of Error
    // Create a Response object for the error case
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, // You might want to dynamically set the status based on the error
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
