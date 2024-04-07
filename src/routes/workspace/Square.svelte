

<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    // e109cac1f5b144a083eba28c6550e4e2
    // eaa8f33e99314f4287e2adacb9a98b9c
    let token  = 'BQAqfd5W9Gtx_nQ3ys4U-1A_MBLJxHSE7hImf2u9YoTLZDuVXNbiiFF8gqxXnp_T2UHEGxqpjW7hsdUaQscvHgQB75x0_js6FKsfUavqFF0OFsAOkCzi29gCLTBqca0q0TyXG8NQsLalFVV_gokQcnTUGrAHsXVP1L7cR_HZ5TIY6QzV9tkFl39oLpuvPF-N_cJf9hB-4Gqo_Dr14tpVEW0FuqXi'; // Ensure this is securely obtained
    let player; // Will hold our Spotify player instance
    let currentTrack = writable(null);
    onMount(() => {

        loadSpotifyPlaybackSDK();
    if (typeof window !== 'undefined') {
      window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
    
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
        });

        
        player.connect().then(success => {
          if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
          }
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.on('playback_error', ({ message }) => {
            console.error('Failed to perform playback', message);
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => { console.error(message); });
        player.addListener('authentication_error', ({ message }) => { console.error(message); });
        player.addListener('account_error', ({ message }) => { console.error(message); });

        play({
            playerInstance: new Spotify.Player({ name: "..." }),
            spotify_uri: 'spotify:track:7xGfFoTpQ2E7fRF5lN10tr',
        });

      };
      

     
    }
  });

  // Function to load the Spotify Playback SDK script dynamically
  function loadSpotifyPlaybackSDK() {
    const scriptTag = document.createElement('script');
    scriptTag.src = 'https://sdk.scdn.co/spotify-player.js';
    document.head.appendChild(scriptTag);
  }

  // Toggle play function
  function togglePlay() {
    console.log(player);
    if (player) {
        player.getCurrentState().then(state => {
        if (!state) {
            console.error('User is not playing music through the Web Playback SDK');
            return;
        }

        var current_track = state.track_window.current_track;
        var next_track = state.track_window.next_tracks[0];

        console.log('Currently Playing', current_track);
        console.log('Playing Next', next_track);
        });
    }


  }
    let volume = 0.5; // Default volume

  // This function is called whenever the slider's value changes
    function setPlayerVolume() {
        player.setVolume(volume).then(() => {
        console.log('Volume updated!');
        }).catch(error => {
        console.error('Error setting volume:', error);
        });
    }

    async function getProfile(accessToken) {
        

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
            Authorization: 'Bearer ' + accessToken
            }
        });
        
        const data = await response.json();
        console.log(data);
        }

    getProfile(token)

// Call the setup function when the script loads

</script>

<a href="https://open.spotify.com/">spotify </a>

<input type="range" min="0" max="1" step="0.01" bind:value={volume} on:input={setPlayerVolume} />
<h3>Volume: {Math.round(volume * 100)}%</h3>

<h1>Spotify Web Playback SDK Quick Start</h1>
<button on:click={player.togglePlay()}>Toggle Play</button>
<button on:click={player.previousTrack()}>Back</button>

<button on:click={player.nextTrack()}>Forward</button>

<button on:click={() => togglePlay()}>test</button>