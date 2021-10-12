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

const MySongsList = MyFullSongs

let audio
class App extends Component {
  state = {
    initialState: true,
    currentSongData: {},
    currentSongsList: [],
    previousSongsList: [],
    previousSongData: {},
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    currentDuration: 0,
    currentVolume: 1,
  }

  componentDidMount() {
    const initialSong =
      MySongsList[Math.floor(Math.random() * MySongsList.length)]
    this.setState(
      {
        currentSongsList: MySongsList,
        currentSongData: initialSong,
        previousSongsList: MySongsList,
        previousSongData: initialSong,
        isPlaying: false,
      },
      this.onAddTrackToAudio,
    )
  }

  componentWillUnmount() {
    audio.removeEventListener('timeupdate', this.updateCurrentTime)
    audio.removeEventListener('volumechange', this.updateVolumeChange)
    audio.removeEventListener('ended', this.updateEnded)
    audio.removeEventListener('mute', this.updateMute)
    audio.pause()
    audio.currentTime = 0
    audio.src = ''
  }

  updateCurrentTime = event => {
    this.setState({currentDuration: event.target.currentTime})
  }

  updateVolumeChange = event => {
    this.setState({currentVolume: event.target.volume})
  }

  updateEnded = () => {
    this.setState({isPlaying: false}, this.onClickNext)
  }

  updateMute = () => {
    this.setState({isMuted: true}, this.onClickAudioMute)
  }

  onAddTrackToAudio = () => {
    const {currentSongData, isPlaying, currentVolume} = this.state
    const {previewUrl} = currentSongData
    audio = new Audio(previewUrl)
    audio.volume = currentVolume
    audio.currentTime = 0

    audio.addEventListener('timeupdate', this.updateCurrentTime)
    audio.addEventListener('volumechange', this.updateVolumeChange)
    audio.addEventListener('ended', this.updateEnded)
    audio.addEventListener('mute', this.updateMute)

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
        audio.addEventListener('timeupdate', this.updateCurrentTime)
        audio.addEventListener('volumechange', this.updateVolumeChange)
        audio.addEventListener('ended', this.updateEnded)
        audio.addEventListener('mute', this.updateMute)

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
    const {currentDuration} = this.state
    audio.currentTime = currentDuration
  }

  onChangeDuration = value => {
    this.setState({currentDuration: value}, this.onChangeAudioDuration)
  }

  onChangeAudioVolume = () => {
    const {currentVolume} = this.state
    audio.volume = currentVolume
  }

  onChangeVolume = value => {
    this.setState({currentVolume: value}, this.onChangeAudioVolume)
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
      const data = currentSongsList[currentSongIndex - 2]
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
          index: currentSongIndex - 1,
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
    }
  }

  onClickAudioMute = () => {
    audio.volume = 0
    audio.muted = true
  }

  onClickAudioUnmute = () => {
    audio.muted = false
    audio.volume = 0.5
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

  onToggleEnvironment = () => {
    audio.pause()
    const {initialState} = this.state
    if (initialState === false) {
      const {currentSongsList, currentSongData} = this.state
      const randomInitial =
        MySongsList[Math.floor(Math.random() * MySongsList.length)]
      this.setState(
        {
          currentSongsList: MySongsList,
          currentSongData: randomInitial,
          previousSongsList: currentSongsList,
          previousSongData: currentSongData,
          initialState: true,
          isPlaying: false,
          currentDuration: audio.currentTime,
        },
        this.onAddTrackToAudio,
      )
    } else {
      const {previousSongsList, previousSongData} = this.state
      this.setState(
        {
          currentSongsList: previousSongsList,
          currentSongData: previousSongData,
          initialState: false,
          isPlaying: false,
        },
        this.onAddTrackToAudio,
      )
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
            audio,
            onClickMute: this.onClickMute,
            onAddTrack: this.onAddTrack,
            onTogglePlay: this.onTogglePlay,
            onChangeDuration: this.onChangeDuration,
            onChangeVolume: this.onChangeVolume,
            onClickNext: this.onClickNext,
            onClickPrevious: this.onClickPrevious,
            onToggleEnvironment: this.onToggleEnvironment,
          }}
        >
          <BrowserRouter>
            <Switch>
              <Route exact path="/login" component={LoginForm} audio={audio} />
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
              <ProtectedRoute exact path="/search" component={Search} audio />
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
