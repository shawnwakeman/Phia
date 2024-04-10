import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

import crypto from 'crypto';

// Helper function to generate a random string for the state parameter
function generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export const GET = () => {

    console.log('Spotify login route called'); 
    const clientId = 'e109cac1f5b144a083eba28c6550e4e2'; // Replace with your Spotify Client ID
    const redirectUri = encodeURIComponent('http://localhost:5173/api/spotify/callback');




    var scope = "streaming \
    user-read-email \
    user-read-private"

    var state = generateRandomString(16);

    var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scope,
    redirect_uri: "http://localhost:5173/api/spotify/callback",
    state: state
    })
        
  

  
    // Redirect the user to Spotify's authorization page
    throw redirect(302, 'https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());

};

