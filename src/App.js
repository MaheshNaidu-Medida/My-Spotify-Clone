import {Component} from 'react'
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import SpotifyClone from './components/SpotifyClone'
import LoginForm from './components/LoginForm'
import Profile from './components/Profile'
import SpecificPlaylist from './components/SpecificPlaylist'
import SpecificCategoryPlaylists from './components/SpecificCategoryPlaylists'
import SpecificCategorySelectedPlaylist from './components/SpecificCategorySelectedPlaylist'
import SpecificAlbum from './components/SpecificAlbum'
import YourMusic from './components/YourMusic'
import YourPlaylists from './components/YourPlaylists'
import YourSelectedPlaylist from './components/YourSelectedPlaylist'
import Search from './components/Search'
import SearchSelectedPlaylist from './components/SearchSelectedPlaylist'
import SearchDefaultCategory from './components/SearchDefaultCategory'
import SearchDefaultPlaylist from './components/SearchDefaultPlaylist'
import ProtectedRoute from './components/ProtectedRoute'
import PlayerContext from './context/PlayerContext'
import MyFullSongs from './MyFullSongs/MyFullSongs'
import './App.css'

const initialSongsList = MyFullSongs
const initialSong =
  initialSongsList[Math.floor(Math.random() * initialSongsList.length)]

let audio = new Audio(initialSongsList[0].previewUrl)
audio.load()
class App extends Component {
  state = {
    initialState: true,
    currentSongData: initialSong,
    currentSongsList: initialSongsList,
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    currentDuration: '',
    currentVolume: '',
  }

  onAddTrackToAudio = () => {
    const {currentSongData, isPlaying} = this.state
    const {previewUrl} = currentSongData
    audio = new Audio(previewUrl)

    audio.addEventListener('timeupdate', event => {
      this.setState({currentDuration: event.target.currentTime})
    })
    audio.addEventListener('volumechange', event => {
      this.setState({currentVolume: event.target.volume})
    })

    audio.addEventListener('ended', () => {
      this.setState({isPlaying: false}, this.onClickNext)
    })
    audio.addEventListener('mute', () => {
      this.setState({isMuted: true}, this.onClickAudioMute)
    })

    audio.load()
    if (isPlaying) {
      this.setState({
        isPlaying: true,
        isLoading: false,
      })
      audio.play()
    } else {
      this.setState({isPlaying: false, isLoading: false})
      audio.pause()
    }
  }

  onAddTrack = (data, items) => {
    audio.pause()
    this.setState(
      {
        currentSongsList: items,
        currentSongData: data,
        isMuted: false,
        isLoading: true,
        initialState: false,
      },
      this.onAddTrackToAudio,
    )
  }

  onToggleAudioPlay = () => {
    const {isPlaying, initialState} = this.state
    if (initialState) {
      if (isPlaying) {
        audio.addEventListener('timeupdate', event => {
          this.setState({currentDuration: event.target.currentTime})
        })
        audio.addEventListener('volumechange', event => {
          this.setState({currentVolume: event.target.volume})
        })

        audio.addEventListener('ended', () => {
          this.setState({isPlaying: false}, this.onClickNext)
        })
        audio.addEventListener('mute', () => {
          this.setState({isMuted: true}, this.onClickAudioMute)
        })

        audio.play()
      } else {
        audio.pause()
      }
    } else if (initialState === false) {
      if (isPlaying) {
        audio.play()
      } else {
        audio.pause()
      }
    }
  }

  onTogglePlay = () => {
    this.setState(
      preState => ({isPlaying: !preState.isPlaying}),
      this.onToggleAudioPlay,
    )
  }

  onChangeAudioDuration = () => {
    const {currentTime} = this.state
    audio.currentTime = currentTime
  }

  onChangeDuration = value => {
    this.setState({currentTime: value}, this.onChangeAudioDuration)
  }

  onChangeAudioVolume = () => {
    const {currentVolume} = this.state
    audio.volume = currentVolume
  }

  onChangeVolume = value => {
    this.setState({currentVolume: value})
  }

  onClickNext = () => {
    audio.pause()
    this.setState(
      {isPlaying: false, isLoading: true},
      this.onClickNextExecution,
    )
  }

  onClickNextExecution = () => {
    const {currentSongData, currentSongsList, initialState} = this.state
    const currentSongIndex = currentSongData.index
    if (currentSongIndex === currentSongsList.length) {
      const data = currentSongsList[0]
      let nextSongData
      if (initialState) {
        nextSongData = data
      } else {
        nextSongData = {
          name: data.track.name,
          duration: data.track.duration_ms,
          artist: data.track.artists[0].name,
          previewUrl: data.track.preview_url,
          images: data.track.album.images,
          index: 1,
        }
      }

      this.setState(
        {currentSongData: nextSongData, isPlaying: true, isLoading: false},
        this.onAddTrackToAudio,
      )
    } else {
      const data = currentSongsList[currentSongIndex]

      let nextSongData

      if (initialState) {
        nextSongData = data
      } else {
        nextSongData = {
          name: data.track.name,
          duration: data.track.duration_ms,
          artist: data.track.artists[0].name,
          previewUrl: data.track.preview_url,
          images: data.track.album.images,
          index: currentSongIndex + 1,
        }
      }

      this.setState(
        {
          currentSongData: nextSongData,
          isPlaying: true,
          isLoading: false,
        },
        this.onAddTrackToAudio,
      )
    }
  }

  onClickPrevious = () => {
    audio.pause()
    this.setState(
      {isPlaying: false, isLoading: true},
      this.onClickPreviousExecution,
    )
  }

  onClickPreviousExecution = () => {
    const {currentSongData, currentSongsList, initialState} = this.state
    const currentSongIndex = currentSongData.index
    if (currentSongIndex === 1) {
      const data = currentSongsList[currentSongsList.length - 1]
      let previousSongData
      if (initialState) {
        previousSongData = data
      } else {
        previousSongData = {
          name: data.track.name,
          duration: data.track.duration_ms,
          artist: data.track.artists[0].name,
          previewUrl: data.track.preview_url,
          images: data.track.album.images,
          index: currentSongsList.length,
        }
      }
      this.setState(
        {
          currentSongData: previousSongData,
          isPlaying: true,
          isLoading: false,
        },
        this.onAddTrackToAudio,
      )
    } else {
      const data = currentSongsList[currentSongIndex - 1]
      const previousSongData = {
        name: data.track.name,
        duration: data.track.duration_ms,
        artist: data.track.artists[0].name,
        previewUrl: data.track.preview_url,
        images: data.track.album.images,
        index: currentSongIndex - 1,
      }
      this.setState(
        {
          currentSongData: previousSongData,
          isPlaying: true,
          isLoading: false,
        },
        this.onAddTrackToAudio,
      )
    }
  }

  onClickAudioMute = () => {
    audio.muted = true
  }

  onClickAudioUnmute = () => {
    audio.muted = false
  }

  onClickMute = () => {
    if (audio === '') {
      this.setState(preState => ({isMuted: !preState.isMuted}))
    } else {
      const {isMuted} = this.state
      if (isMuted) {
        this.setState({isMuted: false}, this.onClickAudioUnmute)
      } else {
        this.setState({isMuted: true}, this.onClickAudioMute)
      }
    }
  }

  render() {
    const {
      initialState,
      currentSongData,
      isLoading,
      isPlaying,
      isMuted,
      totalDuration,
      currentDuration,
      currentVolume,
    } = this.state
    return (
      <>
        <PlayerContext.Provider
          value={{
            initialState,
            currentSongData,
            totalDuration,
            currentDuration,
            currentVolume,
            isLoading,
            isPlaying,
            isMuted,
            onClickMute: this.onClickMute,
            onAddTrack: this.onAddTrack,
            onTogglePlay: this.onTogglePlay,
            onChangeDuration: this.onChangeDuration,
            onChangeVolume: this.onChangeVolume,
            onClickNext: this.onClickNext,
            onClickPrevious: this.onClickPrevious,
          }}
        >
          <BrowserRouter>
            <Switch>
              <Route exact path="/login" component={LoginForm} />
              <ProtectedRoute exact path="/profile" component={Profile} />
              <ProtectedRoute exact path="/" component={SpotifyClone} />
              <ProtectedRoute
                exact
                path="/special-playlist/:id"
                component={SpecificPlaylist}
              />
              <ProtectedRoute
                exact
                path="/category-playlists/category/:cid"
                component={SpecificCategoryPlaylists}
              />
              <ProtectedRoute
                exact
                path="/category-playlists/category/:cid/playlist/:pid"
                component={SpecificCategorySelectedPlaylist}
              />
              <ProtectedRoute
                exact
                path="/specific-album/:id"
                component={SpecificAlbum}
              />
              <ProtectedRoute
                exact
                path="/your-playlists/"
                component={YourPlaylists}
              />
              <ProtectedRoute
                exact
                path="/your-playlists/playlist/:id"
                component={YourSelectedPlaylist}
              />
              <ProtectedRoute exact path="/your-music" component={YourMusic} />
              <ProtectedRoute exact path="/search" component={Search} />
              <ProtectedRoute
                exact
                path="/search/searched-playlist/:id"
                component={SearchSelectedPlaylist}
              />
              <ProtectedRoute
                exact
                path="/search/default-category/:cid"
                component={SearchDefaultCategory}
              />
              <ProtectedRoute
                exact
                path="/search/default-category/:cid/playlist/:pid"
                component={SearchDefaultPlaylist}
              />
            </Switch>
          </BrowserRouter>
        </PlayerContext.Provider>
      </>
    )
  }
}
export default App
