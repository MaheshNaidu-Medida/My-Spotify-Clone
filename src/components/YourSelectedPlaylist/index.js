import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {IoArrowBack, IoMusicalNotes} from 'react-icons/io5'
import moment from 'moment'
import Navbar from '../Navbar'
import Loader from '../Loader'
import './index.css'
import Player from '../Player'
import PlayerContext from '../../context/PlayerContext'

const apiStatusConst = {
  loading: 'LOADING',
  success: 'SUCCESS',
  failure: 'FAILURE',
}
class YourSelectedPlaylist extends Component {
  state = {
    specificPlaylistApiStatus: apiStatusConst.loading,
    currentSelectedTrack: '',
    specificPlaylistData: {},
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

    const getImageUrl = () => {
      if (data.images.length === 0) {
        return ''
      }
      return data.images[0].url
    }
    if (response.ok) {
      const fetchedData = {
        id: data.id,
        imageUrl: getImageUrl(),
        name: data.name,
        tracks: data.tracks,
      }
      this.setState({
        specificPlaylistApiStatus: apiStatusConst.success,
        specificPlaylistData: fetchedData,
      })
    }
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

  renderTotalTracks = total => {
    let detail = ''
    if (total === 0) {
      detail = 'No Tracks'
    } else if (total === 1) {
      detail = `${total} Track`
    } else {
      detail = `${total} Tracks`
    }
    return detail
  }

  renderNoTracksView = () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    return (
      <div className="no-tracks-view">
        <a
          href={`https://open.spotify.com/playlist/${id}`}
          target="_blank"
          className="add-tracks-button"
          rel="noreferrer"
        >
          ADD TRACKS
        </a>
      </div>
    )
  }

  renderTrackItem = (eachTrack, index, items) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
        const {id, name, albumName, duration, artist, added} = updatedEachTrack
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)

        const durationInMins = this.getDurationInMins(duration)
        const addedAt = this.getAddedAt(added)
        const {currentSelectedTrack} = this.state
        const trackStyle =
          currentSelectedTrack === id
            ? 'your-selected-playlist-selected-track'
            : ''
        return (
          <li
            key={id}
            className={`your-selected-playlist-track ${trackStyle}`}
            onClick={onClickSong}
          >
            <p className="your-selected-playlist-text text-color-1 specific-playlist-index-item">
              {index}
            </p>
            <p className="your-selected-playlist-text text-color-1 specific-playlist-title-item">
              {name}
            </p>
            <p className="your-selected-playlist-text text-color-1 specific-playlist-album-item">
              {albumName}
            </p>
            <p className="your-selected-playlist-text text-color-1 specific-playlist-time-item">
              {durationInMins}
            </p>
            <p className="your-selected-playlist-text text-color-1 specific-playlist-artist-item">
              {artist}
            </p>
            <p className="your-selected-playlist-text text-color-1 specific-playlist-added-item">
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
    return (
      <div className="your-selected-playlist-container-desktop">
        <Navbar currentSelected="PLAYLISTS" />
        <div className="your-selected-playlist-main">
          <Link to="/your-playlists/" className="specific-playlist-back-button">
            <IoArrowBack className="arrow-icon" />
            <p className="your-selected-playlist-text text-color-1">Back</p>
          </Link>
          <div className="your-selected-playlist-header">
            {imageUrl === '' ? (
              <div className="your-selected-playlist-no-track-preview">
                <IoMusicalNotes className="your-selected-playlist-no-track-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={imageUrl}
                  alt={name}
                  className="your-selected-playlist-header-image"
                />
              </div>
            )}
            <div className="your-selected-playlist-details">
              <p className="your-selected-playlist-text text-color-2 first-one style">
                "His playlist told more about him than his words did"
              </p>
              <h1 className="your-selected-playlist-heading text-color-2">
                {name}
              </h1>
              <p className="your-selected-playlist-text text-color-3 second-one">
                {this.renderTotalTracks(total)}
              </p>
            </div>
          </div>
          <div className="your-selected-playlist-track-header">
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-index-item">
              #
            </p>
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-title-item">
              Title
            </p>
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-album-item">
              Album
            </p>
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-time-item">
              Time
            </p>
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-artist-item">
              Artist
            </p>
            <p className="your-selected-playlist-text text-color-1 your-selected-playlist-added-item">
              Added
            </p>
          </div>
          <hr className="your-selected-playlist-rule" />

          {items.length === 0 ? (
            this.renderNoTracksView()
          ) : (
            <ul className="your-selected-playlist-tracks-container">
              {items.map(eachItem => {
                index += 1
                return this.renderTrackItem(eachItem, index, items)
              })}
            </ul>
          )}
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </div>
    )
  }

  renderTrackItemMobile = (eachTrack, items, index) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
        const {id, name, duration, artist} = updatedEachTrack
        const durationInMins = this.getDurationInMins(duration)
        const {currentSelectedTrack} = this.state
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)

        const trackStyle =
          currentSelectedTrack === id
            ? 'your-selected-playlist-selected-track'
            : ''
        return (
          <li
            key={id}
            className={`your-selected-playlist-track-mobile ${trackStyle}`}
            onClick={onClickSong}
          >
            <div className="your-selected-playlist-track-details-mobile">
              <p className="your-selected-playlist-track-name-mobile text-color-2">
                {name}
              </p>
              <p className="your-selected-playlist-text-mobile text-color-5">
                {artist}
              </p>
            </div>
            <p className="your-selected-playlist-text-mobile text-color-5">
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

    return (
      <div className="your-selected-playlist-container-mobile">
        <div className="your-selected-playlist-main-mobile">
          <Link
            to="/your-playlists"
            className="your-selected-playlist-back-btn-mobile"
          >
            <IoArrowBack className="your-selected-playlist-arrow-mobile" />
            <p className="your-selected-playlist-text-mobile text-color-1">
              Back
            </p>
          </Link>
          <div className="your-selected-playlist-header-mobile">
            {imageUrl === '' ? (
              <div className="your-selected-playlist-no-track-preview">
                <IoMusicalNotes className="your-selected-playlist-no-track-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={imageUrl}
                  alt={name}
                  className="your-selected-playlist-header-image-mobile"
                />
              </div>
            )}
            <h1 className="your-selected-playlist-heading-mobile text-color-2 specific-playlist-demand-style-mobile">
              {name}
            </h1>
            <p className="your-selected-playlist-text-mobile text-color-4 second-one">
              {this.renderTotalTracks(total)}
            </p>
          </div>

          {items.length === 0 ? (
            this.renderNoTracksView()
          ) : (
            <ul className="your-selected-playlist-tracks-mobile">
              {items.map(eachItem => {
                index += 1
                return this.renderTrackItemMobile(eachItem, items, index)
              })}
            </ul>
          )}
        </div>
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  renderResponsivePlaylist = () => (
    <>
      {this.renderPlaylistMobile()}
      {this.renderPlaylistDesktop()}
    </>
  )

  renderUI = () => {
    const {specificPlaylistApiStatus} = this.state
    switch (specificPlaylistApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderResponsivePlaylist()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}
export default YourSelectedPlaylist
