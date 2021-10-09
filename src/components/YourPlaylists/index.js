import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {IoMusicalNotes} from 'react-icons/io5'
import {GiMusicalScore} from 'react-icons/gi'
import Navbar from '../Navbar'
import Loader from '../Loader'
import Player from '../Player'
import PlayerContext from '../../context/PlayerContext'
import './index.css'

const apiStatusConst = {
  loading: 'API_LOADING',
  success: 'API_SUCCESS',
  failure: 'SPI FAILURE',
}

class YourPlaylists extends Component {
  state = {
    fetchedData: {},
    playlistsApiStatus: apiStatusConst.loading,
  }

  componentDidMount() {
    this.getPlaylistsApi()
  }

  getUserInfoApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = 'https://api.spotify.com/v1/me'

    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      return data.id
    }
    return ''
  }

  getPlaylistsApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const username = await this.getUserInfoApi()
    const url = `https://api.spotify.com/v1/users/${username}/playlists?limit=50`
    const response = await fetch(url, options)

    const data = await response.json()
    if (response.ok) {
      const {total, items} = data
      this.setState({
        playlistsApiStatus: apiStatusConst.success,
        fetchedData: {total, items},
      })
    }
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

  renderPlaylistItemDesktop = eachItem => {
    const {id, images, name, tracks} = eachItem
    const {total} = tracks
    const previewStyle =
      images.length === 0 ? 'no-preview' : 'playlists-preview'

    return (
      <Link to={`/your-playlists/playlist/${id}`} className="each-item-link">
        <li key={id} className="playlists-item-desktop">
          <div className={previewStyle}>
            {images.length === 0
              ? this.renderEmptyPreview()
              : this.renderImagePreview(images)}
          </div>
          <p className="playlists-preview-name text-color-2">{name}</p>
          <p className="playlists-preview-text text-color-3">
            {this.renderTotalTracks(total)}
          </p>
        </li>
      </Link>
    )
  }

  renderPlaylistsDesktop = () => {
    const {fetchedData} = this.state
    const {items, total} = fetchedData
    return (
      <div className="playlists-main-desktop">
        <div className="playlists-header">
          <h1 className="playlists-heading text-color-2">Your Playlists</h1>
          <div className="playlists-counter">{total}</div>
        </div>
        {total === 0 ? (
          this.renderNoPlaylistsView()
        ) : (
          <ul className="playlists-list-desktop">
            {items.map(eachItem => this.renderPlaylistItemDesktop(eachItem))}
          </ul>
        )}
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  renderImagePreview = images => (
    <>
      <img
        src={images[0].url}
        alt="playlist preview"
        className="preview-image"
      />
    </>
  )

  renderEmptyPreview = () => <IoMusicalNotes className="playlists-music-icon" />

  renderPlaylistItemMobile = eachItem => {
    const {id, images, name, tracks} = eachItem
    const {total} = tracks
    const previewStyle =
      images.length === 0 ? 'no-preview' : 'playlists-preview'

    return (
      <Link to={`/your-playlists/playlist/${id}`} className="each-item-link">
        <li key={id} className="playlists-item-mobile">
          <div className={previewStyle}>
            {images.length === 0
              ? this.renderEmptyPreview()
              : this.renderImagePreview(images)}
          </div>
          <div className="playlists-item-details">
            <p className="playlists-preview-name text-color-2">{name}</p>
            <p className="playlists-preview-text text-color-3">
              {this.renderTotalTracks(total)}
            </p>
          </div>
        </li>
      </Link>
    )
  }

  renderNoPlaylistsView = () => (
    <div className="no-playlists-view">
      <GiMusicalScore className="no-music-logo" />
      <h1 className="no-playlists-heading">Create your first playlist</h1>
      <p className="no-playlists-text">It's easy! we'll help you.</p>
      <a
        className="create-playlist-link"
        href="https://open.spotify.com/collection/playlists"
        target="_blank"
        rel="noreferrer"
      >
        CREATE PLAYLIST
      </a>
      <PlayerContext.Consumer>
        {value => <Player value={value} />}
      </PlayerContext.Consumer>
    </div>
  )

  renderPlaylistsMobile = () => {
    const {fetchedData} = this.state
    const {total, items} = fetchedData
    return (
      <div className="playlists-main-mobile">
        <div className="playlists-header">
          <h1 className="playlists-heading text-color-2">Your Playlists</h1>
          <div className="playlists-counter">{total}</div>
        </div>

        {total === 0 ? (
          this.renderNoPlaylistsView()
        ) : (
          <ul className="playlists-list-mobile">
            {items.map(eachItem => this.renderPlaylistItemMobile(eachItem))}
          </ul>
        )}
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  renderResponsivePlaylists = () => (
    <div className="playlists-container">
      <Navbar currentSelected="PLAYLISTS" />
      {this.renderPlaylistsMobile()}
      {this.renderPlaylistsDesktop()}
    </div>
  )

  renderUI = () => {
    const {playlistsApiStatus} = this.state
    switch (playlistsApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderResponsivePlaylists()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}
export default YourPlaylists
