import { CLIENT_ID, REDIRECT_URI } from "./key.js";

const redirect = REDIRECT_URI;
const client_id = CLIENT_ID;

const playlistsURL = "https://api.spotify.com/v1/me/playlists?offset=0&limit=20";
const podcastsURL = "https://api.spotify.com/v1/me/shows?offset=0&limit=20";
const episodesURL = "https://api.spotify.com/v1/me/episodes?offset=0&limit=4";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(client_id, redirect);
} else {
    const accessToken = await getAccessToken(client_id, redirect, code);
    const playlists = await fetchAPI(accessToken, playlistsURL);
    const podcasts = await fetchAPI(accessToken, podcastsURL);
    const episodes = await fetchAPI(accessToken, episodesURL);
    // console.log(episodes);
    populateUI(playlists.items, podcasts.items, episodes.items);
}

async function redirectToAuthCodeFlow(clientId, redirectUri) {
    // TODO: Redirect to Spotify authorization page
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", "user-read-private user-read-email playlist-read-private user-library-read user-read-playback-position");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function getAccessToken(clientId, redirectUri, code) {
    // TODO: Get access token for code
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchAPI(token, url) {
    // TODO: Call Web API
    const result = await fetch(url, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(playlists, podcasts, episodes) {
    // TODO: Update UI with data
    const playlist = playlists.map(p => {
        const list = document.createElement('a');
        list.classList.add('flex');
        list.innerHTML = `
            <img src=${p.images[0] ? p.images[0].url : "assets/likedsongs.jpg"} alt="">
            <h4>${p.name}</h4>
        `;
        return list;
    });
    
    playlist.forEach(p => {
        document.querySelector("aside .list").append(p);
    });

    const pod = podcasts.map(p => {
        const list = document.createElement('a');
        list.classList.add('flex');
        list.innerHTML = `
            <img src=${p.show.images[0] ? p.show.images[0].url : "assets/likedsongs.jpg"} alt="">
            <h4>${p.show.name}</h4>
        `;
        return list;
    });
    
    pod.forEach(p => {
        document.querySelector("aside .list").append(p);
    });

    /** --------------------------------------------------- **/

    const podcast = podcasts.map(p => {
        const list = document.createElement('div');
        list.innerHTML = `
            <img src=${p.show.images[0].url} alt="">
            <h4>${p.show.name}</h4>
            <h5>${p.show.publisher}</h5>
        `;
        return list;
    });
    
    podcast.forEach(p => {
        document.querySelector(".your-shows .list").append(p);
    });

    /** --------------------------------------------------- **/

    const episode = episodes.map(p => {
        const list = document.createElement('div');
        list.innerHTML = `
            <img src=${p.episode.images[0].url} alt="">
            <h4>${p.episode.name}</h4>
            <h5>${p.episode.show.name}</h5>
        `;
        return list;
    });
    
    episode.forEach(p => {
        document.querySelector(".saved-episodes .list").append(p);
    });

    /** --------------------------------------------------- **/

    const list = `
        <a href="#" class="flex">
            <img src="assets/likedsongs.jpg" alt="">
            <h3>Liked Songs</h3>
        </a>
        <a href="#" class="flex">
            <img src=${playlists[0].images[0].url} alt="">
            <h3>${playlists[0].name}</h3>
        </a>
        <a href="#" class="flex">
            <img src=${playlists[1].images[0].url} alt="">
            <h3>${playlists[1].name}</h3>
        </a>
        <a href="#" class="flex">
            <img src="assets/thejournal.jpeg" alt="">
            <h3>The Journal.</h3>
        </a>
        <a href="#" class="flex">
            <img src="assets/effwon.jpeg" alt="">
            <h3>eff won with DRS</h3>
        </a>
        <a href="#" class="flex">
            <img src="assets/thepotterverse.png" alt="">
            <h3>The Potterverse: A Harry Potter Podcast</h3>
        </a>
    `

    document.querySelector(".playlists").innerHTML = list;
}

/** --------------------------- Profile Modal --------------------------- **/

document.querySelector("main #profile").addEventListener('click', () => {
    document.querySelector(".profile-modal").classList.toggle('showing');
});