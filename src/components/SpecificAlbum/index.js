import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {IoArrowBack, IoMusicalNotes} from 'react-icons/io5'
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

class SpecificAlbum extends Component {
  state = {
    specificAlbumApiStatus: apiStatusConst.loading,
    specificAlbumData: {},
  }

  componentDidMount() {
    this.getSpecificAlbumApi()
  }

  getSpecificAlbumApi = async () => {
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
    const url = `https://api.spotify.com/v1/albums/${id}`

    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const fetchedData = {
        artists: data.artists,
        images: data.images,
        name: data.name,
        releaseDate: data.release_date,
        total: data.total_tracks,
        tracks: data.tracks,
        albumType: data.album_type,
      }
      this.setState({
        specificAlbumApiStatus: apiStatusConst.success,
        specificAlbumData: fetchedData,
      })
    }
  }

  getDurationInMinsHeader = duration => {
    const durationInSec = moment.duration(duration).seconds()
    const durationInMin = moment.duration(duration).minutes()

    if (durationInSec < 10) {
      return `${durationInMin} min 0${durationInSec} sec`
    }
    return `${durationInMin} min ${durationInSec} sec`
  }

  getDurationInMins = duration => {
    const durationInSec = moment.duration(duration).seconds()
    const durationInMin = moment.duration(duration).minutes()

    if (durationInSec < 10) {
      return `${durationInMin}:0${durationInSec}`
    }
    return `${durationInMin}:${durationInSec}`
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

  renderNoTracksView = () => (
    <div className="specific-album-no-tracks-view">
      <p className="specific-album-heading-mobile text-color-2">No Tracks</p>
    </div>
  )

  renderTrackItem = (eachTrack, index) => {
    const {id, name} = eachTrack
    const duration = eachTrack.duration_ms
    const durationInMins = this.getDurationInMins(duration)

    const {currentSelectedTrack} = this.state
    const trackStyle =
      currentSelectedTrack === id ? 'specific-album-selected-track' : ''
    return (
      <li key={id} className={`specific-album-track ${trackStyle}`}>
        <p className="specific-album-text text-color-1 specific-playlist-index-item">
          {index}
        </p>
        <p className="specific-album-text text-color-1 specific-album-track-item">
          {name}
        </p>

        <p className="specific-album-text text-color-1 specific-album-time-item">
          {durationInMins}
        </p>
        <p className="specific-album-text text-color-1 specific-album-popularity-item">
          Popularity
        </p>
      </li>
    )
  }

  renderSpecificAlbumDesktop = () => {
    let index = 0
    const {specificAlbumData} = this.state
    const {
      artists,
      images,
      name,
      releaseDate,
      total,
      tracks,
      albumType,
    } = specificAlbumData
    const {items} = tracks
    const releaseYear = new Date(releaseDate).getFullYear()
    let totalDuration = 0
    tracks.items.forEach(element => {
      totalDuration += element.duration_ms
    })
    totalDuration = this.getDurationInMinsHeader(totalDuration)
    return (
      <div className="specific-album-container-desktop">
        <Navbar currentSelected="HOME" />
        <div className="specific-album-main">
          <Link to="/" className="specific-album-back-button">
            <IoArrowBack className="arrow-icon" />
            <p className="specific-album-text text-color-1">Back</p>
          </Link>
          <div className="specific-album-header">
            {images[0].url === undefined ? (
              <div className="specific-album-no-header-preview">
                <IoMusicalNotes className="specific-album-no-header-preview-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={images[0].url}
                  alt={name}
                  className="specific-album-header-image"
                />
              </div>
            )}
            <div className="specific-album-details">
              <p className="specific-album-text text-color-2 first-one ">
                {albumType.toUpperCase()}
              </p>
              <h1 className="specific-album-heading text-color-2">{name}</h1>
              <p className="specific-album-text text-color-2 second-one">
                {artists[0].name} {' • '} {releaseYear} {' • '}
                <span className="text-color-5">
                  {this.renderTotalTracks(total)}, {totalDuration}
                </span>
              </p>
            </div>
          </div>
          <div className="specific-album-track-header">
            <p className="specific-album-text text-color-1 your-selected-playlist-index-item">
              #
            </p>
            <p className="specific-album-text text-color-1 specific-album-track-item">
              Track
            </p>

            <p className="specific-album-text text-color-1 specific-album-time-item">
              Time
            </p>
            <p className="specific-album-text text-color-1 specific-album-popularity-item">
              Popularity
            </p>
          </div>
          <hr className="specific-album-rule" />

          {items.length === 0 ? (
            this.renderNoTracksView()
          ) : (
            <ul className="specific-album-tracks-container">
              {items.map(eachItem => {
                index += 1
                return this.renderTrackItem(eachItem, index)
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

  renderTrackItemMobile = eachTrack => {
    const {id, name, artists} = eachTrack
    const duration = eachTrack.duration_ms
    const durationInMins = this.getDurationInMins(duration)
    const {currentSelectedTrack} = this.state
    const trackStyle =
      currentSelectedTrack === id ? 'specific-album-selected-track' : ''
    return (
      <li key={id} className={`specific-album-track-mobile ${trackStyle}`}>
        <div className="specific-album-track-details-mobile">
          <p className="specific-album-track-name-mobile text-color-2">
            {name}
          </p>
          <p className="your-selected-playlist-text-mobile text-color-5">
            {artists[0].name}
          </p>
        </div>
        <p className="your-selected-playlist-text-mobile text-color-5">
          {durationInMins}
        </p>
      </li>
    )
  }

  renderSpecificAlbumMobile = () => {
    const {specificAlbumData} = this.state
    const {images, name, releaseDate, total, tracks} = specificAlbumData
    const {items} = tracks
    const imageUrl = images[0].url
    const release = new Date(releaseDate)
    const releaseYear = release.getFullYear()
    let totalDuration = 0
    tracks.items.forEach(element => {
      totalDuration += element.duration_ms
    })
    totalDuration = this.getDurationInMinsHeader(totalDuration)

    return (
      <div className="specific-album-container-mobile">
        <div className="specific-album-main-mobile">
          <Link to="/" className="specific-album-back-btn-mobile">
            <IoArrowBack className="specific-album-arrow-mobile" />
            <p className="specific-album-text-mobile text-color-1">Back</p>
          </Link>
          <div className="specific-album-header-mobile">
            {imageUrl === undefined ? (
              <div className="specific-album-no-header-preview">
                <IoMusicalNotes className="specific-album-no-header-preview-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={imageUrl}
                  className="specific-album-header-image-mobile"
                  alt={name}
                />
              </div>
            )}
            <h1 className="specific-album-heading-mobile text-color-2 specific-album-demand-style-mobile">
              {name}
            </h1>
            <p className="specific-album-text-mobile text-color-2">
              {releaseYear} . {totalDuration}
            </p>
            <p className="specific-album-text-mobile text-color-5 second-one">
              {this.renderTotalTracks(total)}
            </p>
          </div>
          {items.length === 0 ? (
            this.renderNoTracksView()
          ) : (
            <ul className="specific-album-tracks-mobile">
              {items.map(eachItem => this.renderTrackItemMobile(eachItem))}
            </ul>
          )}
        </div>
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  renderResponsiveAlbum = () => (
    <div className="specific-album-container">
      {this.renderSpecificAlbumMobile()}
      {this.renderSpecificAlbumDesktop()}
    </div>
  )

  renderUI = () => {
    const {specificAlbumApiStatus} = this.state
    switch (specificAlbumApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderResponsiveAlbum()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}
export default SpecificAlbum
