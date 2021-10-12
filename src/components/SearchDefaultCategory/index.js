import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import {IoArrowBack} from 'react-icons/io5'
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
class SearchDefaultCategory extends Component {
  state = {
    fetchedData: {},
    specificCategoryPlaylistApiStatus: apiStatusConst.loading,
    failureCount: 5,
  }

  componentDidMount() {
    this.getSpecificCategoryPlaylistApi()
  }

  getCategoryPlaylistTitleApi = async () => {
    const token = Cookies.get('pa_token')
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
      const {match} = this.props
      const {params} = match
      const {cid} = params
      const categoryPlaylistItem = data.categories.items.find(
        eachCategoryItem => {
          if (cid === eachCategoryItem.id) {
            return true
          }
          return false
        },
      )
      return categoryPlaylistItem.name
    }
    return ''
  }

  getUserCountryApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = 'https://api.spotify.com/v1/me'

    const responseObj = await fetch(url, options)
    const dataObj = await responseObj.json()
    if (responseObj.ok) {
      return dataObj.country
    }
    return ''
  }

  getSpecificCategoryPlaylistApi = async () => {
    const token = Cookies.get('pa_token')
    const {match} = this.props
    const {params} = match
    const {cid} = params
    const country = await this.getUserCountryApi()
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/browse/categories/${cid}/playlists?country=${country}`
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      const categoryPlaylistTitle = await this.getCategoryPlaylistTitleApi()
      const updatedData = {
        playlists: data.playlists,

        categoryPlaylistTitle,
      }
      this.setState({
        specificCategoryPlaylistApiStatus: apiStatusConst.success,
        fetchedData: updatedData,
      })
    } else {
      this.setState(
        {specificCategoryPlaylistApiStatus: apiStatusConst.failure},
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

  renderSpecificCategoryDesktopItem = eachItem => {
    const {id, images, name, tracks} = eachItem
    const imageUrl = images[0].url
    const {total} = tracks
    const {match} = this.props
    const {params} = match
    const {cid} = params
    if (id === null || id === undefined || id === '') {
      return null
    }
    return (
      <Link
        to={`/search/default-category/${cid}/playlist/${id}`}
        className="each-item-link"
      >
        <li key={id} className="specific-category-playlist-item">
          <div>
            <img
              src={imageUrl}
              alt={name}
              className="specific-category-playlist-preview"
            />
          </div>
          <p className="specific-category-playlist-preview-name text-color-2">
            {name}
          </p>
          <p className="specific-category-playlist-preview-text text-color-3">
            {total} Tracks
          </p>
        </li>
      </Link>
    )
  }

  renderSpecificCategoryPlaylistDesktop = () => {
    const {fetchedData} = this.state
    const {playlists, categoryPlaylistTitle} = fetchedData
    const {items} = playlists
    const total = items.length

    return (
      <>
        <Navbar currentSelected="SEARCH" />
        <div className="specific-category-playlist-main">
          <Link to="/search" className="specific-category-playlist-back-button">
            <IoArrowBack className="arrow-icon" />
            <p className="specific-category-playlist-text text-color-1">Back</p>
          </Link>
          <div className="specific-category-playlist-header">
            <h1 className="specific-category-playlist-heading text-color-2">
              {categoryPlaylistTitle}
            </h1>
            <div className="specific-category-playlist-counter">{total}</div>
          </div>
          <ul className="specific-category-playlists">
            {items.map(eachItem =>
              this.renderSpecificCategoryDesktopItem(eachItem),
            )}
          </ul>
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </>
    )
  }

  renderSpecificCategoryPlaylistItem = eachItem => {
    const {id, images, name, tracks} = eachItem
    const imageUrl = images[0].url
    const {total} = tracks
    const {match} = this.props
    const {params} = match
    const {cid} = params

    return (
      <Link
        to={`/search/default-category/${cid}/playlist/${id}`}
        className="each-item-link"
      >
        <li key={id} className="specific-category-playlist-item-mobile">
          <div>
            <img
              src={imageUrl}
              alt={name}
              className="specific-category-playlist-preview"
            />
          </div>
          <div className="specific-category-playlist-item-details">
            <p className="specific-category-playlist-preview-name text-color-2">
              {name}
            </p>
            <p className="specific-category-playlist-text-mobile text-color-3">
              {total} Tracks
            </p>
          </div>
        </li>
      </Link>
    )
  }

  renderSpecificCategoryPlaylistMobile = () => {
    const {fetchedData} = this.state
    const {playlists, categoryPlaylistTitle} = fetchedData
    const {items} = playlists
    const total = items.length

    return (
      <div className="specific-category-playlist-main-mobile">
        <Link
          to="/search"
          className="specific-category-playlist-back-btn-mobile"
        >
          <IoArrowBack className="specific-category-playlist-arrow-mobile" />
          <p className="specific-category-playlist-text-mobile text-color-1">
            Back
          </p>
        </Link>
        <div className="specific-category-playlist-header">
          <h1 className="specific-category-playlist-heading text-color-2">
            {categoryPlaylistTitle}
          </h1>
          <div className="specific-category-playlist-counter">{total}</div>
        </div>
        <ul className="specific-category-playlists-mobile">
          {items.map(eachItem =>
            this.renderSpecificCategoryPlaylistItem(eachItem),
          )}
        </ul>
        <PlayerContext.Consumer>
          {value => <Player value={value} />}
        </PlayerContext.Consumer>
      </div>
    )
  }

  responsiveSpecificCategoryPlaylist = () => (
    <div className="specific-category-playlist-container">
      {this.renderSpecificCategoryPlaylistMobile()}
      {this.renderSpecificCategoryPlaylistDesktop()}
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
    const {specificCategoryPlaylistApiStatus} = this.state

    switch (specificCategoryPlaylistApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.responsiveSpecificCategoryPlaylist()
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
export default SearchDefaultCategory
