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
class SpecificCategorySelectedPlaylist extends Component {
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
    const {pid} = params
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/users/spotify/playlists/${pid}`

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
    }
    return track
  }

  renderTrackItem = (eachTrack, index) => {
    const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
    const {id, name, albumName, duration, artist, added} = updatedEachTrack
    const durationInMins = this.getDurationInMins(duration)
    const addedAt = this.getAddedAt(added)
    const {currentSelectedTrack} = this.state
    const trackStyle =
      currentSelectedTrack === id
        ? 'category-selected-playlist-selected-track'
        : ''
    return (
      <li key={id} className={`specific-playlist-track ${trackStyle}`}>
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
  }

  renderPlaylistDesktop = () => {
    let index = 0
    const {specificPlaylistData} = this.state
    const {description, imageUrl, name, tracks} = specificPlaylistData
    const {total, items} = tracks
    const {match} = this.props
    const {params} = match
    const {cid} = params
    return (
      <>
        <Navbar currentSelected="HOME" />
        <div className="category-selected-playlist-main">
          <Link
            to={`/category-playlists/category/${cid}`}
            className="category-selected-playlist-back-button"
          >
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
                {description}
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
            {items.map(eachItem => {
              index += 1
              return this.renderTrackItem(eachItem, index)
            })}
          </ul>
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </>
    )
  }

  renderTrackItemMobile = eachTrack => {
    const updatedEachTrack = this.getUpdatedEachTrack(eachTrack)
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
  }

  renderPlaylistMobile = () => {
    const {specificPlaylistData} = this.state
    const {description, imageUrl, name, tracks} = specificPlaylistData
    const {total, items} = tracks
    const {match} = this.props
    const {params} = match
    const {cid} = params
    return (
      <div className="category-selected-playlist-main-mobile">
        <Link
          to={`/category-playlists/category/${cid}`}
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
            {description}
          </p>
          <p className="category-selected-playlist-text-mobile text-color-4 second-one">
            {total} Tracks
          </p>
        </div>
        <ul className="category-selected-playlist-tracks-mobile">
          {items.map(eachItem => this.renderTrackItemMobile(eachItem))}
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
export default SpecificCategorySelectedPlaylist
