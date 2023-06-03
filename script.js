import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from "./key.js";

const redirect = REDIRECT_URI;
const client_id = CLIENT_ID;
const client_secret = CLIENT_SECRET;

const playlistsURL = "https://api.spotify.com/v1/me/playlists?offset=0&limit=20";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(client_id, redirect);
} else {
    const accessToken = await getAccessToken(client_id, redirect, code);
    const playlists = await fetchPlaylists(accessToken);
    console.log(playlists.items);
    populateUI(playlists.items);
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
    params.append("scope", "user-read-private user-read-email playlist-read-private");
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

async function fetchPlaylists(token) {
    // TODO: Call Web API
    const result = await fetch(playlistsURL, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(playlists) {
    // TODO: Update UI with profile data
    const playlist = playlists.map(p => {
        const list = document.createElement('a');
        list.classList.add('flex');
        list.innerHTML = `
            <img src="assets/likedsongs.jpg" alt="">
            <h4>${p.name}</h4>
        `;
        return list;
    });
    
    playlist.forEach(p => {
        document.querySelector("aside .list").append(p);
    });
}