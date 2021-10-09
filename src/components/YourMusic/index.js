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
class YourMusic extends Component {
  state = {
    yourMusicApiStatus: apiStatusConst.loading,
    fetchedData: {},
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
    }
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

  renderYourMusicTrack = eachItem => {
    const {track} = eachItem
    const {album, artists, id, name} = track
    const duration = this.getDurationInMins(track.duration_ms)
    const {images} = album
    const imageUrl = images[0].url
    const artist = artists[0].name
    return (
      <>
        <li key={id} className="your-music-track">
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
                <p className="your-music-track-artist text-color-5">{artist}</p>
              </div>
            </div>
          </div>
          <p className="your-music-track-duration text-color-5">{duration}</p>
        </li>

        <li key={id} className="your-music-track-desktop">
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
  }

  renderYourMusic = () => {
    const {fetchedData} = this.state
    const {total, items} = fetchedData

    return (
      <div className="your-music-container">
        <Navbar currentSelected="YOUR_MUSIC" />
        <div className="your-music-main">
          <div className="your-music-header">
            <h1 className="your-music-heading text-color-2">Your Music</h1>
            <div className="your-music-counter">{total}</div>
          </div>
          {items.length === 0 ? (
            this.renderNoTracks()
          ) : (
            <ul className="your-music-tracks">
              {items.map(eachItem => this.renderYourMusicTrack(eachItem))}
            </ul>
          )}
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </div>
    )
  }

  renderUI = () => {
    const {yourMusicApiStatus} = this.state

    switch (yourMusicApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderYourMusic()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}
export default YourMusic
