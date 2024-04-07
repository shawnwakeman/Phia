<script>
    import { onMount } from 'svelte';
    let accessToken = 'BQDGA6UoXBpc6wPCyrqzbY-IxNFhOgUdgNZsemhAyzbGmjRVWhWjHkr8RmYxPgtoEBfkasPNl4-BZZsqpxT1my9tFbCDVgkXj9eyy-s2Cp6SqfPlCb_SlQE79awjqpRRciOKuIpjJtm5Aert8xPBAuzSmtgCzraQRmj8BVFb0f9Xp7ZjynPXBhILPxxYQ8-d0TL29RMgzN7tZFjsK280ReiG1m87'; // Ensure this is securely obtained
    let player; // This will be our Spotify player instance
    let currentTrack = null;
    let volume = 0.5; // Volume ranges from 0.0 to 1.0
  
    onMount(() => {
      if (window.Spotify) {
        initPlayer();
      } else {
        window.onSpotifyWebPlaybackSDKReady = initPlayer;
      }
    });
  
    function initPlayer() {
      player = new Spotify.Player({
        name: 'Your Svelte App Player',
        getOAuthToken: cb => { cb(accessToken); },
        volume: volume
      });
  
      // Error handling
      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });
  
      // Playback status updates
      player.addListener('player_state_changed', state => {
        console.log(state);
        if (state) {
          const { current_track } = state.track_window;
          currentTrack = current_track;
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
  
      player.connect();
    }
  
    // Function to adjust volume
    function setVolume(newVolume) {
      if (player && newVolume >= 0 && newVolume <= 1) {
        player.setVolume(newVolume).then(() => {
          volume = newVolume;
        });
      }
    }
  </script>
  
  <!-- Display current track info and controls -->
  {#if currentTrack}
    <div>
      <img src={currentTrack.album.images[0].url} alt="Track image" />
      <div>{currentTrack.name} by {currentTrack.artists.map(artist => artist.name).join(', ')}</div>
    </div>
  {/if}
  
  <label for="volume">Volume:</label>
  <input type="range" id="volume" min="0" max="1" step="0.01" value={volume} on:change={event => setVolume(event.target.value)} />
  