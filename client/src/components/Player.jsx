import {useState, useEffect} from 'react'
import SpotifyPlayer from "react-spotify-web-playback"

const Player = ({ accessToken, trackUri}) => {
  const [play, setPlay] = useState(false)

  useEffect(() => setPlay(true), [trackUri])

  if(!accessToken) return null
  return <SpotifyPlayer 
  token={accessToken}
  showSaveIcon
  callback={state => {
    if(!state.isPlaying) setPlay(false)
  }}
  play={play}
  uris={trackUri ? [trackUri] : []} 

  styles={{
    activeColor: '#fff',
    bgColor: '#000',
    color: '#fff',
    loaderColor: '#fff',
    sliderColor: '#fff',
    trackArtistColor: '#ccc',
    trackNameColor: '#fff',
  }}
 
  magnifySliderOnHover
  hideAttribution
   />
}

export default Player