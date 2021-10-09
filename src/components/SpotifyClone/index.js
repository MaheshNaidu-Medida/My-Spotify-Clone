import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
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

class SpotifyClone extends Component {
  state = {
    homeApiStatus: apiStatusConst.loading,
    fetchedData: {},
  }

  componentDidMount() {
    this.callApis()
  }

  getToken = () => {
    const token = Cookies.get('pa_token')
    return token
  }

  callApis = async () => {
    const playlistsData = await this.getPlaylistsApi()
    const categoryPlaylistsData = await this.getCategoryPlaylistsApi()
    const albumsData = await this.getAlbumsApi()
    const fetchedData = {
      playlistsData,
      categoryPlaylistsData,
      albumsData,
    }
    this.setState({
      homeApiStatus: apiStatusConst.success,
      fetchedData,
    })
  }

  getUserInfoApi = async () => {
    const token = this.getToken()
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
      const {country} = data
      return country
    }
    return ''
  }

  getPlaylistsApi = async () => {
    const token = this.getToken()
    const country = await this.getUserInfoApi()
    const timeStamp = moment(new Date()).format('YYYY-MM-DDTHH:00:00')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/browse/featured-playlists?country=${country}&timestamp=${timeStamp}`
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const {message} = data
      const {playlists} = data
      const {items} = playlists
      const playlistsData = {
        message,
        items,
      }

      return playlistsData
    }
    return null
  }

  getCategoryPlaylistsApi = async () => {
    const token = this.getToken()
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = 'https://api.spotify.com/v1/browse/categories'
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const {categories} = data
      const {items} = categories
      const categoryPlaylistsData = items
      return categoryPlaylistsData
    }
    return null
  }

  getAlbumsApi = async () => {
    const token = this.getToken()
    const country = await this.getUserInfoApi()
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/browse/new-releases?country=${country}`
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const {albums} = data
      const {items} = albums
      const albumsData = items
      return albumsData
    }
    return null
  }

  renderLoader = () => <Loader />

  renderAlbumItem = eachItem => {
    const {id, images, name} = eachItem
    const imageUrl = images[1].url
    return (
      <Link to={`/specific-album/${id}`} className="each-item-link">
        <li className="home-list-item-3" key={id}>
          <div>
            <img className="home-preview-item" src={imageUrl} alt={name} />
          </div>
          <p className="home-preview-text">{name}</p>
        </li>
      </Link>
    )
  }

  renderAlbums = () => {
    const {fetchedData} = this.state
    const {albumsData} = fetchedData
    return (
      <>
        <h1 className="home-heading">New Releases</h1>
        <ul className="home-album-list-container">
          {albumsData.map(eachItem => this.renderAlbumItem(eachItem))}
        </ul>
      </>
    )
  }

  getRandomColor = () => {
    const colorsArray = [
      '#EC6D45',
      '#E39C40',
      '#44B844',
      '#4B5B63',
      '#D8383B',
      '#7F5FFF',
      '#3965C5',
      '#9EB8C6',
      '#3AADC9',
      '#8ABF3D',
      '#4840CA',
      '#006369',
      '#D28935',
      '#8635CF',
      '#34C598',
      '#C73555',
      '#AC3EBA',
      '#279653',
    ]
    const index = Math.floor(Math.random() * colorsArray.length)
    const color = colorsArray[index]
    return color
  }

  renderCategoryPlaylistsItem = eachItem => {
    const {id, name, icons} = eachItem
    const imageUrl = icons[0].url
    const bgColor = this.getRandomColor()
    return (
      <Link
        to={`/category-playlists/category/${id}`}
        className="each-item-link"
      >
        <li className="home-list-item-2" key={id}>
          <div
            className="home-preview-item home-preview-special"
            style={{
              backgroundColor: `${bgColor}`,
            }}
          >
            <p className="home-preview-spl-text">{name}</p>
            <img src={imageUrl} alt={name} className="home-preview-spl-img" />
          </div>
        </li>
      </Link>
    )
  }

  renderCategoryPlaylists = () => {
    const {fetchedData} = this.state
    const {categoryPlaylistsData} = fetchedData
    return (
      <>
        <h1 className="home-heading">Genres & Moods</h1>
        <ul className="home-list-container">
          {categoryPlaylistsData.map(eachItem =>
            this.renderCategoryPlaylistsItem(eachItem),
          )}
        </ul>
      </>
    )
  }

  renderPlaylistsItem = eachItem => {
    const {images, name, id} = eachItem
    const imageUrl = images[0].url

    return (
      <Link to={`/special-playlist/${id}`} className="each-item-link">
        <li className="home-list-item-1" key={id}>
          <img className="home-preview-item" src={imageUrl} alt={name} />
          <p className="home-preview-text">{name}</p>
        </li>
      </Link>
    )
  }

  renderPlaylists = () => {
    const {fetchedData} = this.state
    const {playlistsData} = fetchedData
    const {message, items} = playlistsData
    return (
      <>
        <h1 className="home-heading">{message}</h1>
        <ul className="home-list-container">
          {items.map(eachItem => this.renderPlaylistsItem(eachItem))}
        </ul>
      </>
    )
  }

  renderItems = () => (
    <div className="home-container">
      <Navbar currentSelected="HOME" />
      <div className="home-main-container">
        {this.renderPlaylists()}
        {this.renderCategoryPlaylists()}
        {this.renderAlbums()}
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    </div>
  )

  renderUI = () => {
    const {homeApiStatus} = this.state

    switch (homeApiStatus) {
      case apiStatusConst.success:
        return this.renderItems()
      case apiStatusConst.loading:
        return this.renderLoader()
      default:
        return null
    }
  }

  render() {
    return this.renderUI()
  }
}

export default SpotifyClone
