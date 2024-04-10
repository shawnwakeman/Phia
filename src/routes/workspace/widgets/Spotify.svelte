

<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';



    let isMuted = false; // Track mute status
    let prevVolume = 0.5; // Remember volume before muting
    let isShuffle = false; // Track shuffle status
    let playlists = []; // To store the fetched playlists
    let playbackPosition = 0;

    let player;
    let isPaused = false;
   
    let calledLogin = false
    let currentTrack = {
        name: '',
        album: {
        images: [{ url: '' }],
        },
        artists: [{ name: '' }],
    };

    let token = writable('');
    let refreshTokenTimer;

    async function refreshAccessToken() {
        if (player) {
            player.disconnect()
        }
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            console.error('No refresh token available');
            // Redirect to login or handle accordingly
            return;
        }

        const response = await fetch('/api/spotify/refresh_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            console.log("refreshed");
            
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            token.set(data.access_token);
            // Optionally update the refresh token if a new one is returned
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token);
            }
            if (player) {
                setupPlayer()
            }
        
        } else {
            console.error('Failed to refresh access token');
            // Handle token refresh failure (e.g., redirect to login)
        }
    }

    onDestroy(() => {
        // Clear the interval timer when the component is destroyed
        if (refreshTokenTimer) clearInterval(refreshTokenTimer);
    });


    onMount(() => {

        refreshAccessToken();

        refreshTokenTimer = setInterval(refreshAccessToken, 59 * 60 * 1000);


        const storedAccessToken = localStorage.getItem('access_token');

     
    
        loadSpotifyPlaybackSDK();
            if (storedAccessToken) {
                token.set(storedAccessToken);
                if (typeof window !== 'undefined') {
                    window.onSpotifyWebPlaybackSDKReady = () => {
                        setupPlayer();
                        player.togglePlay()

                    };
                };
            };
            
        



    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      player.disconnect();
    }


    window.addEventListener("beforeunload", handleBeforeUnload);

    function handlePopState(event: PopStateEvent): void {
      player.disconnect();
      // Handle SPA navigation change if necessary
    }

    // Listen for popstate event triggered by navigating with browser's buttons
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  });

  function setupPlayer() {
    // Ensure the SDK and token are ready
    if (!window.Spotify || !token) return;

    player = new window.Spotify.Player({
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: cb => cb($token),
          volume: 0.25,
        });
        player.removeListener('ready');
        // Event listeners
        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          transferPlaybackToDevice(device_id, $token);
          
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('player_state_changed', state => {
          if (!state) {
            console.log("no state");
            
            return;
          }
          playbackPosition = state.position;

          currentTrack = state.track_window.current_track;
          isPaused = state.paused;
          
        });

        player.connect().then(success => {
            if (success) {
                console.log('The Web Playback SDK successfully connected to Spotify!');
            }
        })


    // Setup event listeners for the player...
  }

  async function transferPlaybackToDevice(device_id, accessToken) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            device_ids: [device_id], // Array of device IDs
            play: true // Whether to start playing. Set to false if you don't want music to start playing automatically
        })
        });

        if (response.ok) {
        console.log('Playback successfully transferred');
        } else {
        console.error('Failed to transfer playback', response);
        }
    } catch (error) {
        console.error('Error transferring playback', error);
    }
    }


  // Function to load the Spotify Playback SDK script dynamically
  function loadSpotifyPlaybackSDK() {
    if (document.getElementById('spotify-sdk-script')) return; // Prevent multiple injections
        const script = document.createElement('script');
        script.id = 'spotify-sdk-script';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
  }

  // Toggle play function
  function togglePlay() {
    console.log(player);
    if (player) {
        token.set("sasdsdd")
        console.log($token);
        

    }


  }
    let volume = 0.5; // Default volume

  // This function is called whenever the slider's value changes


    // Updated setPlayerVolume function
    function setPlayerVolume() {
    if (!player) return; // Check if player is initialized

    player.setVolume(volume).then(() => {
        console.log(`Volume updated to ${volume}!`);
    }).catch(error => {
        console.error('Error setting volume:', error);
    });
    }

    function toggleMute() {
    if (isMuted) {
        // Unmute: Restore the previous volume
        volume = prevVolume;
        isMuted = false;
    } else {
        // Mute: Remember the current volume and set volume to 0
        prevVolume = volume;
        volume = 0;
        isMuted = true;
    }
    
    // Apply the volume change to the player
        setPlayerVolume();
    }

    async function toggleShuffle() {
        const accessToken = $token; // Ensure you have the current access token
        isShuffle = !isShuffle; // Toggle the local shuffle state
        
        try {
            const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${isShuffle}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            });

            if (response.ok) {
            console.log(`Shuffle ${isShuffle ? 'enabled' : 'disabled'}`);
            } else {
            console.error('Failed to toggle shuffle', response);
            }
        } catch (error) {
            console.error('Error toggling shuffle', error);
        }
        }








// Call the setup function when the script loads

</script>

<a href="https://open.spotify.com/">spotify </a>


<div class="container">
    <div class="main-wrapper">
        <img src={currentTrack.album.images[0]?.url} alt="Album cover" class="now-playing__cover" />
      
        <div class="now-playing__side">
            <div class="now-playing__name">{currentTrack.name}</div>
            <div class="now-playing__artist">{currentTrack.artists[0]?.name}</div>
        </div>
  
        <div class="playback-controls">
            <button on:click={() => player.previousTrack()}>« Previous</button>
            <button on:click={() => player.togglePlay()}>
            {isPaused ? 'Play' : 'Pause'}
            </button>
            <button on:click={() => player.nextTrack()}>Next »</button>
            <button on:click={() => refreshAccessToken()}>Next »</button>

        <div class="volume-controls">
            <label for="volumeSlider">Volume:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              id="volumeSlider"
              bind:value={volume}
              on:input={setPlayerVolume} />
        </div>
            <button on:click={toggleMute}>
                {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button on:click={toggleShuffle}>
            {isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
            </button>
        </div>
    </div>
</div>
  

  