import {Component} from 'react'
import Cookies from 'js-cookie'
import moment from 'moment'
import {IoMusicalNotes} from 'react-icons/io5'
import {RiMusicLine} from 'react-icons/ri'
import Navbar from '../Navbar'
import Loader from '../Loader'
import Player from '../Player'
import PlayerContext from '../../context/PlayerContext'
import './index.css'

const apiStatusConst = {
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

let intervalId
class YourMusic extends Component {
  state = {
    yourMusicApiStatus: apiStatusConst.loading,
    fetchedData: {},
    failureCount: 5,
  }

  componentDidMount() {
    this.getYourMusicApi()
  }

  getYourMusicApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = 'https://api.spotify.com/v1/me/tracks'
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const fetchedData = {
        total: data.total,
        items: data.items,
      }
      this.setState({yourMusicApiStatus: apiStatusConst.success, fetchedData})
    } else {
      this.setState(
        {yourMusicApiStatus: apiStatusConst.failure},
        this.runFailureCount,
      )
    }
  }

  clearFailureInterval = () => {
    const {failureCount} = this.state
    if (failureCount === 0 || failureCount < 0) {
      clearInterval(intervalId)
      const {history} = this.props
      Cookies.remove('pa_token')
      history.replace('/login')
    }
  }

  runFailureCount = () => {
    const {audio} = this.props
    audio.pause()
    audio.currentTime = 0
    intervalId = setInterval(() => {
      this.setState(
        preState => ({failureCount: preState.failureCount - 1}),
        this.clearFailureInterval,
      )
    }, 1000)
  }

  getUpdatedEachTrack = eachTrack => {
    const track = {
      id: eachTrack.track.id,
      trackNumber: eachTrack.track.track_number,
      name: eachTrack.track.name,
      albumName: eachTrack.track.album.name,
      duration: eachTrack.track.duration_ms,
      artist: eachTrack.track.artists[0].name,
      added: eachTrack.added_at,
      previewUrl: eachTrack.track.preview_url,
      images: eachTrack.track.album.images,
    }
    return track
  }

  getDurationInMins = duration => {
    const durationInSec = moment.duration(duration).seconds()
    const durationInMin = moment.duration(duration).minutes()

    if (durationInSec < 10) {
      return `${durationInMin}:0${durationInSec}`
    }
    return `${durationInMin}:${durationInSec}`
  }

  renderNoTracks = () => (
    <div className="your-music-no-tracks">
      <RiMusicLine className="your-music-no-tracks-logo" />
      <h1 className="your-music-heading text-color-2">
        Songs you like will appear here
      </h1>
      <a
        href="https://open.spotify.com/collection/tracks"
        target="_blank"
        className="your-music-add-tracks-button"
        rel="noreferrer"
      >
        FIND SONGS
      </a>
    </div>
  )

  renderYourMusicTrack = (eachItem, index, items) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachItem)
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)

        const {track} = eachItem
        const {album, artists, id, name} = track
        const duration = this.getDurationInMins(track.duration_ms)
        const {images} = album
        const imageUrl = images[0].url
        const artist = artists[0].name
        return (
          <>
            <li key={id} className="your-music-track" onClick={onClickSong}>
              <div>
                <div className="your-music-track-header">
                  {imageUrl === undefined ? (
                    <div className="your-music-track-no-image">
                      <IoMusicalNotes className="your-music-no-image-icon" />
                    </div>
                  ) : (
                    <div className="your-music-track-image-container">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="your-music-track-image"
                      />
                    </div>
                  )}
                  <div className="your-music-track-details">
                    <p className="your-music-track-name text-color-2">{name}</p>
                    <p className="your-music-track-artist text-color-5">
                      {artist}
                    </p>
                  </div>
                </div>
              </div>
              <p className="your-music-track-duration text-color-5">
                {duration}
              </p>
            </li>

            <li
              key={id}
              className="your-music-track-desktop"
              onClick={onClickSong}
            >
              <div>
                <div className="your-music-track-header-desktop">
                  {imageUrl === undefined ? (
                    <div className="your-music-track-no-image-desktop">
                      <IoMusicalNotes className="your-music-no-image-icon-desktop" />
                    </div>
                  ) : (
                    <div className="your-music-track-image-container-desktop">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="your-music-track-image-desktop"
                      />
                    </div>
                  )}
                  <div className="your-music-track-details-desktop">
                    <p className="your-music-track-name-desktop text-color-2">
                      {name}
                    </p>
                    <p className="your-music-track-artist-desktop text-color-5">
                      {artist}
                    </p>
                  </div>
                </div>
              </div>
              <p className="your-music-track-duration-desktop text-color-5">
                {duration}
              </p>
            </li>
          </>
        )
      }}
    </PlayerContext.Consumer>
  )

  renderYourMusic = () => {
    const {fetchedData} = this.state
    const {total, items} = fetchedData
    let index = 0
    const previewUrlFilteredItems = items.filter(each => {
      if (
        each.track.preview_url === null ||
        each.track.preview_url === undefined ||
        each.track.preview_url === ''
      ) {
        return false
      }
      return true
    })
    return (
      <div className="your-music-container">
        <Navbar currentSelected="YOUR_MUSIC" />
        <div className="your-music-main">
          <div className="your-music-header">
            <h1 className="your-music-heading text-color-2">Your Music</h1>
            <div className="your-music-counter">{total}</div>
          </div>
          {previewUrlFilteredItems.length === 0 ? (
            this.renderNoTracks()
          ) : (
            <>
              <ul className="your-music-tracks">
                {previewUrlFilteredItems.map(eachItem => {
                  index += 1
                  return this.renderYourMusicTrack(
                    eachItem,
                    index,
                    previewUrlFilteredItems,
                  )
                })}
              </ul>
              <a
                href="https://open.spotify.com/collection/tracks"
                target="_blank"
                className="your-music-add-tracks-button"
                rel="noreferrer"
              >
                FIND SONGS
              </a>
            </>
          )}
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </div>
    )
  }

  renderFailure = () => {
    const {failureCount} = this.state
    return (
      <PlayerContext.Consumer>
        {value => {
          const {audio} = value
          audio.pause()
          audio.currentTime = 0
          return (
            <div className="failure-container">
              <img
                src="https://res.cloudinary.com/maheshnaiducloudinary/image/upload/v1633941997/My%20Spotify%20Clone/My%20Spotify%20Logo/My_Spotify_Logo_s05z7j.png"
                alt="Spotify"
                className="login-website-logo-desktop-image"
              />
              <h1 className="failure-heading-1">Oops! Something went wrong</h1>
              <p className="failure-heading-2">
                Redirecting to login in {failureCount} seconds...
              </p>
            </div>
          )
        }}
      </PlayerContext.Consumer>
    )
  }

  renderUI = () => {
    const {yourMusicApiStatus} = this.state

    switch (yourMusicApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderYourMusic()
      case apiStatusConst.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}
export default YourMusic
