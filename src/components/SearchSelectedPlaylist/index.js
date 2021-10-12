import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {IoArrowBack} from 'react-icons/io5'
import moment from 'moment'
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

class SearchSelectedPlaylist extends Component {
  state = {
    specificPlaylistApiStatus: apiStatusConst.loading,
    currentSelectedTrack: '',
    specificPlaylistData: {},
    failureCount: 5,
  }

  componentDidMount() {
    this.getSpecificPlaylistApi()
  }

  getSpecificPlaylistApi = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/users/spotify/playlists/${id}`

    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const fetchedData = {
        description: data.description,
        id: data.id,
        imageUrl: data.images[0].url,
        name: data.name,
        tracks: data.tracks,
      }
      this.setState({
        specificPlaylistApiStatus: apiStatusConst.success,
        specificPlaylistData: fetchedData,
      })
    } else {
      this.setState(
        {specificPlaylistApiStatus: apiStatusConst.failure},
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

  getAddedAt = added => {
    const addedAt = moment(added, 'YYYYMMDD').fromNow()
    return addedAt
  }

  getDurationInMins = duration => {
    const durationInSec = moment.duration(duration).seconds()
    const durationInMin = moment.duration(duration).minutes()

    if (durationInSec < 10) {
      return `${durationInMin}:0${durationInSec}`
    }
    return `${durationInMin}:${durationInSec}`
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

  renderTrackItem = (eachTrack, index, items) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)
        const {id, name, albumName, duration, artist, added} = updatedEachTrack
        const durationInMins = this.getDurationInMins(duration)
        const addedAt = this.getAddedAt(added)
        const {currentSelectedTrack} = this.state
        const trackStyle =
          currentSelectedTrack === id
            ? 'category-selected-playlist-selected-track'
            : ''

        return (
          <li
            key={id}
            className={`specific-playlist-track ${trackStyle}`}
            onClick={onClickSong}
          >
            <p className="category-selected-playlist-text text-color-1 specific-playlist-index-item">
              {index}
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-title-item">
              {name}
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-album-item">
              {albumName}
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-time-item">
              {durationInMins}
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-artist-item">
              {artist}
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-added-item">
              {addedAt}
            </p>
          </li>
        )
      }}
    </PlayerContext.Consumer>
  )

  renderPlaylistDesktop = () => {
    let index = 0
    const {specificPlaylistData} = this.state
    const {imageUrl, name, tracks} = specificPlaylistData
    const {total, items} = tracks
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
      <>
        <Navbar currentSelected="HOME" />
        <div className="category-selected-playlist-main">
          <Link to="/search" className="category-selected-playlist-back-button">
            <IoArrowBack className="arrow-icon" />
            <p className="category-selected-playlist-text text-color-1">Back</p>
          </Link>
          <div className="category-selected-playlist-header">
            <div>
              <img
                src={imageUrl}
                alt={name}
                className="category-selected-playlist-header-image"
              />
            </div>
            <div className="category-selected-playlist-details">
              <p className="category-selected-playlist-text text-color-2 first-one">
                PLAYLIST
              </p>
              <h1 className="category-selected-playlist-heading text-color-2">
                {name}
              </h1>
              <p className="category-selected-playlist-text text-color-3 second-one">
                {total} Tracks
              </p>
            </div>
          </div>
          <div className="category-selected-playlist-track-header">
            <div className="category-selected-playlist-index-item empty-item">
              Empty
            </div>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-title-item">
              Title
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-album-item">
              Album
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-time-item">
              Time
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-artist-item">
              Artist
            </p>
            <p className="category-selected-playlist-text text-color-1 specific-playlist-added-item">
              Added
            </p>
          </div>
          <hr className="category-selected-playlist-rule" />

          <ul className="category-selected-playlist-tracks-container">
            {previewUrlFilteredItems.map(eachItem => {
              index += 1
              return this.renderTrackItem(
                eachItem,
                index,
                previewUrlFilteredItems,
              )
            })}
          </ul>
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </>
    )
  }

  renderTrackItemMobile = (eachTrack, index, items) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)
        const {id, name, duration, artist} = updatedEachTrack
        const durationInMins = this.getDurationInMins(duration)
        const {currentSelectedTrack} = this.state
        const trackStyle =
          currentSelectedTrack === id
            ? 'category-selected-playlist-selected-track'
            : ''
        return (
          <li
            key={id}
            className={`category-selected-playlist-track-mobile ${trackStyle}`}
            onClick={onClickSong}
          >
            <div className="category-selected-playlist-track-details-mobile">
              <p className="category-selected-playlist-track-name-mobile text-color-2">
                {name}
              </p>
              <p className="category-selected-playlist-text-mobile text-color-5">
                {artist}
              </p>
            </div>
            <p className="category-selected-playlist-text-mobile text-color-5">
              {durationInMins}
            </p>
          </li>
        )
      }}
    </PlayerContext.Consumer>
  )

  renderPlaylistMobile = () => {
    const {specificPlaylistData} = this.state
    const {imageUrl, name, tracks} = specificPlaylistData
    const {total, items} = tracks
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
      <div className="category-selected-playlist-main-mobile">
        <Link
          to="/search"
          className="category-selected-playlist-back-btn-mobile"
        >
          <IoArrowBack className="category-selected-playlist-arrow-mobile" />
          <p className="category-selected-playlist-text-mobile text-color-1">
            Back
          </p>
        </Link>
        <div className="category-selected-playlist-header-mobile">
          <div>
            <img
              src={imageUrl}
              alt={name}
              className="category-selected-playlist-header-image-mobile"
            />
          </div>
          <h1 className="category-selected-playlist-heading-mobile text-color-2 specific-playlist-demand-style-mobile">
            {name}
          </h1>
          <p className="category-selected-playlist-text-mobile text-color-1 specific-playlist-demand-style-mobile">
            PLAYLIST
          </p>
          <p className="category-selected-playlist-text-mobile text-color-4 second-one">
            {total} Tracks
          </p>
        </div>
        <ul className="category-selected-playlist-tracks-mobile">
          {previewUrlFilteredItems.map(eachItem => {
            index += 1
            return this.renderTrackItemMobile(
              eachItem,
              index,
              previewUrlFilteredItems,
            )
          })}
        </ul>
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  renderResponsivePlaylist = () => (
    <div className="category-selected-playlist-container">
      {this.renderPlaylistMobile()}

      {this.renderPlaylistDesktop()}
    </div>
  )

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
    const {specificPlaylistApiStatus} = this.state
    switch (specificPlaylistApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderResponsivePlaylist()
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
export default SearchSelectedPlaylist
