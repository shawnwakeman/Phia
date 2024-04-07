

<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';


    let token  = 'BQDMEMfqAGdeZlRzEwW-ijKjyEZq7VGHZhSLOh-I7nPW9NTi94AROxx8BB6Zm_FwEzX2ZdByYKqiW5-oaZcyV1JmBd_F9DTgDsRsnZHBgtHUNZrLoOKbNu87ACpfCiOMepS-5Y2LVYqNw8efkPRpy61CfQaIadoSOQa-l-Vio8YG2oEuofCqIDFtxXkw6jkfwYyPzq76_3xNlvt4xKORO7YEEFMu'; // Ensure this is securely obtained
    let player; // Will hold our Spotify player instance
    let currentTrack = writable(null);
    onMount(() => {

        loadSpotifyPlaybackSDK();
    if (typeof window !== 'undefined') {
      window.onSpotifyWebPlaybackSDKReady = () => {
        player = new Spotify.Player({
    
          name: 'Web Playback SDK Quick Start Player',
          getOAuthToken: cb => { cb(token); },
          volume: 0.9
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
</script>

<h1>Spotify Web Playback SDK Quick Start</h1>
<button on:click={player.togglePlay()}>Toggle Play</button>
<button on:click={player.previousTrack()}>Back</button>

<button on:click={player.nex()}>Forward</button>

<button on:click={() => togglePlay()}>test</button>