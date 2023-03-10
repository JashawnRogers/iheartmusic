import { useState, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import TrackSearchResult from './TrackSearchResult'
import Player from './Player'
import SpotifyWebApi from 'spotify-web-api-node'

import { Container, Form } from 'react-bootstrap'
import axios from 'axios'


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_CLIENT_ID,
})



const Dashboard = ({ code }) => {
  const accessToken = useAuth(code)
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState([]);
  const [lyrics, setLyrics] = useState('');
  
  
  const chooseTrack = (track) => {
    setPlayingTrack(track)
    setSearch('')
    setLyrics('')
  }

  useEffect(() =>{
    if (!playingTrack) return

    axios.get('http://localhost:3001/lyrics', {
      params: {
        track: playingTrack.title,
        artist: playingTrack.artist
      }
    }).then(res => {
      setLyrics(res.data.lyrics)
    })
  }, [playingTrack])

  // console.log(accessToken)
  //Set access token on Spotify api whenever it changes
  useEffect(() => {
    if(!accessToken) return 
    // console.log('Access Token: ',accessToken)
    spotifyApi.setAccessToken(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return console.log('Access Token: ',accessToken);
    
    // cancel to only make a request once done typing
    let cancel = false
    spotifyApi.searchTracks(search).then(res => {
      if (cancel) return
      setSearchResults(res.body.tracks.items.map(track => {
        const smallestAlbumImage = track.album.images.reduce((smallest, image) => {
          if (image.height < smallest.height) return image 
          return smallest
        }, track.album.images[0])

        const largestAlbumImage = track.album.images.reduce((largest, image) => {
          if (image.height > largest.height) return image 
          return largest
        }, track.album.images[0])

        return {
          artist: track.artists[0].name,
          title: track.name,
          uri: track.uri,
          albumUrl: smallestAlbumImage.url,
          albumCover: largestAlbumImage.url
        }
      }))
    }).catch(err => {
      console.log(err);
    })

    return () => cancel = true
  }, [search, accessToken])
  
  console.log(playingTrack)
  return (
  <Container className='d-flex flex-column py-3 bg-dark text-white' style={{ height: "100vh", minWidth: '100vw' }}>
     <Form.Control 
     type="search"
     placeholder="Search Songs or Artists..." 
     value={search}
     onChange={e => setSearch(e.target.value)}
     />

     <div className="flex-grow-1 my-2" style={{ overflowY: "auto" }}>
     {searchResults.map(track => (
        <TrackSearchResult track={track} key={track.uri} chooseTrack={chooseTrack}/>
      ))}
      {searchResults.length === 0 && (
        <div className="text-center" style={{whiteSpace: 'pre'}}>
          { !search ? lyrics : 
            <div className='mt-4'>
              <img src={playingTrack.albumCover} alt={playingTrack.title} style={{height: '400px', width: '400px'}}/>
            </div>
          }
        </div>
      )}
     </div>
     <div className="">
      <Player accessToken={accessToken} trackUri={playingTrack?.uri}/>
     </div>
  </Container>
  )
}

export default Dashboard