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
const colorsArray = [
  '#fc08d8',
  '#5207f2',
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

let intervalId

class SpotifyClone extends Component {
  state = {
    homeApiStatus: apiStatusConst.loading,
    fetchedData: {},
    failureCount: 5,
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
    if (
      playlistsData === null ||
      categoryPlaylistsData === null ||
      albumsData === null
    ) {
      this.setState(
        {homeApiStatus: apiStatusConst.failure},
        this.runFailureCount,
      )
    } else {
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
    if (id === null || id === undefined || id === '') {
      return null
    }
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

  /* getRandomColor = () => { 
    const index = Math.floor(Math.random() * colorsArray.length)
    const color = colorsArray[index]
    return color
  } */

  renderCategoryPlaylistsItem = (eachItem, colorIndex) => {
    const {id, name, icons} = eachItem
    const imageUrl = icons[0].url

    const bgColor = colorsArray[colorIndex]
    if (id === null || id === undefined || id === '') {
      return null
    }
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
    let colorIndex = -1
    return (
      <>
        <h1 className="home-heading">Genres & Moods</h1>
        <ul className="home-list-container">
          {categoryPlaylistsData.map(eachItem => {
            colorIndex += 1
            return this.renderCategoryPlaylistsItem(eachItem, colorIndex)
          })}
        </ul>
      </>
    )
  }

  renderPlaylistsItem = eachItem => {
    const {images, name, id} = eachItem

    const imageUrl = images[0].url
    if (id === null || id === undefined || id === '') {
      return null
    }
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
    const {homeApiStatus} = this.state

    switch (homeApiStatus) {
      case apiStatusConst.success:
        return this.renderItems()
      case apiStatusConst.loading:
        return this.renderLoader()
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

export default SpotifyClone
