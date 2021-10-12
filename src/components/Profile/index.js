import {Component} from 'react'
import Cookies from 'js-cookie'
import {FaUser} from 'react-icons/fa'
import Navbar from '../Navbar'
import Loader from '../Loader'
import Player from '../Player'

import PlayerContext from '../../context/PlayerContext'

import './index.css'

const apiStatusConst = {
  loading: 'API_LOADING',
  success: 'API_SUCCESS',
  failure: 'API_FAILURE',
}
let intervalId
class Profile extends Component {
  state = {
    profileApiStatus: apiStatusConst.loading,
    profileData: {},
    failureCount: 5,
  }

  componentDidMount() {
    this.getProfileApi()
  }

  getProfileApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = 'https://api.spotify.com/v1/me'
    const responseObj = await fetch(url, options)
    const data = await responseObj.json()

    if (responseObj.ok) {
      const playlistsCount = await this.getPlaylistCountApi(data.id)
      const fetchedData = {
        username: data.display_name,
        email: data.email,
        followers: data.followers,
        images: data.images,
        playlistsCount,
      }
      this.setState({
        profileApiStatus: apiStatusConst.success,
        profileData: fetchedData,
      })
    } else {
      this.setState(
        {profileApiStatus: apiStatusConst.failure},
        this.runFailureCount,
      )
    }
  }

  getPlaylistCountApi = async email => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const url = `https://api.spotify.com/v1/users/${email}/playlists`
    const response = await fetch(url, options)
    const data = await response.json()
    if (response.ok) {
      return data.items.length
    }
    return '-'
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

  onClickLogout = () => {
    Cookies.remove('pa_token')
    const {history} = this.props
    history.replace('/login')
  }

  renderProfile = () => {
    const {profileData} = this.state
    const {username, followers, images, email, playlistsCount} = profileData
    const {total} = followers
    return (
      <div className="profile-container">
        <Navbar currentSelected="PROFILE" />
        <div className="profile-main">
          {images.length === 0 ? (
            <div className="profile-no-user-image">
              <FaUser className="profile-icon" />
            </div>
          ) : (
            <div>
              <img
                src={images[0].url}
                alt={username}
                className="profile-image"
              />
            </div>
          )}
          <h1 className="profile-name">{username}</h1>
          <p className="profile-email">{email}</p>
          <div className="profile-statistics">
            <div className="profile-detail-container">
              <p className="profile-detail profile-detail-count-color">
                {total}
              </p>
              <p className="profile-detail profile-detail-text-color">
                FOLLOWERS
              </p>
            </div>
            <div className="profile-detail-container">
              <p className="profile-detail profile-detail-count-color">
                {playlistsCount}
              </p>
              <p className="profile-detail profile-detail-text-color">
                PLAYLISTS
              </p>
            </div>
          </div>
          <button
            type="button"
            className="profile-logout-button"
            onClick={this.onClickLogout}
          >
            LOGOUT
          </button>
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
    const {profileApiStatus} = this.state

    switch (profileApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderProfile()
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
export default Profile
