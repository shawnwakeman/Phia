export async function load({ request }) {
    // Access cookies from the request headers
    const cookies = request.headers.get('cookie') || '';

    // Function to manually extract the token value by key name
    function extractTokenValue(cookies: string, key: string): string {
        const keyStart = cookies.indexOf(`${key}":"`);
        if (keyStart === -1) return ''; // Key not found

        const valueStart = keyStart + key.length + 3; // Adjust for key, two quotes, and colon
        const valueEnd = cookies.indexOf('",', valueStart);
        if (valueEnd === -1) {
            // Handle case for last item or no closing quote found
            const endOfCookie = cookies.indexOf('"}', valueStart);
            return endOfCookie !== -1 ? cookies.substring(valueStart, endOfCookie) : '';
        }

        const token = cookies.substring(valueStart, valueEnd);
        return token;
    }

    const accessToken = extractTokenValue(cookies, 'access_token');
    console.log("Access token:", accessToken);

    const refreshToken = extractTokenValue(cookies, 'refresh_token');
    console.log("Refresh token:", refreshToken);

    // Return the token value
    return {
        refreshToken: refreshToken,
        token: accessToken
    
    };
}
