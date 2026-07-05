import { NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  
  // Explicitly build the form parameters to ensure zero character truncation on Vercel workers
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", REFRESH_TOKEN || "");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Spotify Token Refresh Failed:", errorText);
    throw new Error(`Spotify Auth Mismatch: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function GET() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      return NextResponse.json({ 
        isPlaying: false, 
        debug: "Environment tokens missing on live container profile" 
      });
    }

    const access_token = await getAccessToken();
    
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    });

    if (response.status === 204) {
      return NextResponse.json({ isPlaying: false, debug: "204: Nothing currently playing" });
    }

    if (response.status > 400) {
      const errLog = await response.text();
      return NextResponse.json({ isPlaying: false, debug: `Spotify API Error ${response.status}: ${errLog}` });
    }

    const song = await response.json();
    
    if (!song || !song.item) {
      return NextResponse.json({ isPlaying: false, debug: "Empty track object payload" });
    }

    return NextResponse.json({
      isPlaying: song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map((_artist) => _artist.name).join(", "),
      album: song.item.album.name,
      songUrl: song.item.external_urls.spotify,
    });
  } catch (error) {
    return NextResponse.json({ isPlaying: false, debug: error.message });
  }
}