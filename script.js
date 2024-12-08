const songList = [];
let adPlaying = false;
let player = null;
let currentSong = 0;
let playing = false;
const apiKey = api_key; // Replace with your API key
const playlistId = playlist_id; // Replace with the YouTube playlist ID

const artistName = document.querySelector('.artist-name');
const musicName = document.querySelector('.song-name');
const fillBar = document.querySelector('.fill-bar');
const time = document.querySelector('.time');
const cover = document.getElementById('cover');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const prog = document.querySelector('.progress-bar');

// FUNCTIONALITY

function onYouTubeIframeAPIReady(){
    player = new YT.Player('player', {
      height: '1',
      width: '1',
      videoId: '',
      events: {
        onReady: () => console.log('YouTube Player is ready'),
        onStateChange: onYouTubeStateChange,
      },
    });
}

function onYouTubeStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        console.log("Video ended");
        nextSong();
    }

    if (event.data === YT.PlayerState.PLAYING) {
        console.log("Video Playing");
        setInterval(updateProgress, 100);
    }

    if (event.data == YT.PlayerState.PAUSED) {              
        console.log("Video Paused");
    }

    if (event.data == YT.PlayerState.BUFFERING) {               
        console.log("Video Buffering");
    }

    if (event.data == YT.PlayerState.CUED) {                
        console.log("Video Cued");
    }
}

function loadYouTubeAPI() {
    if (!window.YT) {
        const script = document.createElement('script');
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
        console.log('YouTube API script added');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadYouTubeAPI();
    await fetchPlaylistVideos(playlistId);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    playBtn.addEventListener('click', playMusic);
    prog.addEventListener('click', seek);
});

async function fetchPlaylistVideos(playlistId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items) {
            data.items.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                const title = item.snippet.title;
                const thumbnail = item.snippet.thumbnails.default.url;
                const channelTitle = item.snippet.channelTitle;

                songList.push({
                    name: title,
                    artist: channelTitle,
                    src: videoId,
                    cover: thumbnail,
                });
            });

            console.log('Playlist loaded:', songList);

            if (songList.length > 0) {
                loadSong(currentSong);
            }
        } else {
            console.error('No videos found in playlist');
        }
    } catch (error) {
        console.error('Error fetching playlist:', error);
    }
}

function loadSong(index) {
    const { name, artist, src, cover: thumb } = songList[index];
    artistName.textContent = artist;
    musicName.textContent = name;
    cover.style.backgroundImage = `url(${thumb})`;

    if (!player) {
        console.error('YouTube Player is not initialized yet. Retrying...');
        setTimeout(() => loadSong(index), 500); // Retry after 500ms
        return;
    }
    console.log("loaded song with id: " + src);
    player.loadVideoById(src);
}

function togglePlayPause() {
    if (playing && player) {
        player.pauseVideo();
    } else if (!playing && player) {
        player.playVideo();
    }
    playing = !playing;
    updateUI();
}

function updateProgress() {
    if (player) {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();

        const pos = (currentTime / duration) * 100;
        fillBar.style.width = `${pos}%`;

        const formatedDuration = formatTime(duration);
        const formatedCurrentTime = formatTime(currentTime);
        time.textContent = `${formatedCurrentTime} - ${formatedDuration}`;
    }
}

function nextSong() {
    currentSong = (currentSong + 1) % songList.length;
    playMusic();
}

function prevSong() {
    currentSong = (currentSong - 1 + songList.length) % songList.length;
    playMusic();
}

function playMusic() {
    loadSong(currentSong);
    togglePlayPause();
}

function seek(e) {
    if (player) {
        const pos = (e.offsetX / prog.clientWidth) * player.getDuration();
        player.seekTo(pos, true);
    }
}

function updateUI() {
    playBtn.classList.toggle('fa-pause', playing);
    playBtn.classList.toggle('fa-play', !playing);
    cover.classList.toggle('active', playing);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}