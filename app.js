const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const volumeControl = document.getElementById('volume');
const videoUrlInput = document.getElementById('video-url');
const playTime = document.getElementById('play-time');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('video-title');
const seekBar = document.getElementById('seek-bar');

let player;

if (halfmoon.readCookie("halfmoon_preferredMode")) {
  if (halfmoon.readCookie("halfmoon_preferredMode") == "light-mode") {
    // Light mode is preferred
  }
  else if (halfmoon.readCookie("halfmoon_preferredMode") == "dark-mode") {
    // Dark mode is preferred
  }
}

halfmoon.toggleDarkMode();

function toggleDemo() {
  halfmoon.toggleDarkMode();
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      showinfo: 0,
      rel: 0,
      enablejsapi: 1,
    },
    events: {
      onReady: onPlayerReady,
      onError: onPlayerError,
      onStateChange: onPlayerStateChange,
    },
  });
}

async function fetchVideoDetails(videoId) {
  const apiKey = process.env.API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      thumbnail.src = video.snippet.thumbnails.default.url;
      videoTitle.textContent = video.snippet.title;
    }
  } catch (error) {
    console.error('Failed to fetch video details:', error);
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    player.playVideo();
  }
}

function onPlayerReady() {
  playBtn.addEventListener('click', async () => {
    const videoId = getVideoIdFromUrl(videoUrlInput.value);
    if (videoId) {
      if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
      } else if (player.getPlayerState() === YT.PlayerState.PAUSED) {
        player.playVideo();
      } else {
        player.loadVideoById(videoId);
        player.setVolume(volumeControl.value);
        console.log('Playing video with ID:', videoId);
        await fetchVideoDetails(videoId);
      }
    } else {
      console.error('Invalid YouTube video URL:', videoUrlInput.value);
    }
  });

  pauseBtn.addEventListener('click', () => {
    player.pauseVideo();
    console.log('Video paused');
  });

  stopBtn.addEventListener('click', () => {
    player.stopVideo();
    console.log('Video stopped');
  });

  volumeControl.addEventListener('input', () => {
    player.setVolume(volumeControl.value);
    console.log('Volume set to:', volumeControl.value);
  });

  setInterval(updatePlayTime, 1000);
  setInterval(updateSeekBar, 1000); // Add this line to update the seek bar regularly

}

function onPlayerError(event) {
  console.error('Player error:', event.data);
}

function getVideoIdFromUrl(url) {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function updateSeekBar() {
  if (player && player.getDuration && player.getCurrentTime) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const seekBarValue = (currentTime / duration) * 100;
    seekBar.style.width = `${seekBarValue}%`; // Update the width of the progress bar
  }
}

function updatePlayTime() {
  if (player && player.getCurrentTime) {
    const currentTime = player.getCurrentTime();
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);
    playTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Add event listener for seek bar changes
seekBar.addEventListener('input', () => {
  if (player && player.getDuration) {
    const seekToTime = player.getDuration() * (seekBar.value / 100);
    player.seekTo(seekToTime, true);
    console.log('Seeking to:', seekToTime);
  }
});

function updateSeekBar() {
  if (player && player.getDuration && player.getCurrentTime) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const seekBarValue = (currentTime / duration) * 100;
    seekBar.value = seekBarValue;
  }
}

setInterval(() => {
  if (player && player.getDuration && player.getCurrentTime) {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    const seekBarValue = (currentTime / duration) * 100;
    seekBar.value = seekBarValue;
  }
}, 1000);