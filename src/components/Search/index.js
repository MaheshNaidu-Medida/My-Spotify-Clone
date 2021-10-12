import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import moment from 'moment'
import {BsSearch} from 'react-icons/bs'
import {IoMusicalNotes} from 'react-icons/io5'
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
  '#fc08d8',
  '#5207f2',
]
let intervalId
class Search extends Component {
  state = {
    searchApiStatus: apiStatusConst.loading,
    searchValue: '',
    initialData: {},
    fetchedSearchData: {},
    isSeeAllEnabled: false,
    isPlaylistSeeAllEnabled: false,
    failureCount: 5,
  }

  componentDidMount() {
    this.getDefaultSearchApi()
  }

  getSearchContentApi = async () => {
    const token = Cookies.get('pa_token')
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    const {searchValue} = this.state
    if (searchValue === '') {
      this.getDefaultSearchApi()
    } else {
      const url = `https://api.spotify.com/v1/search?type=track,playlist&q=${searchValue}&market=from_token`

      const response = await fetch(url, options)
      const data = await response.json()

      if (response.ok) {
        this.setState({
          searchApiStatus: apiStatusConst.success,
          fetchedSearchData: {
            trackItems: data.tracks.items,
            playlistItems: data.playlists.items,
          },
        })
      } else {
        this.setState(
          {searchApiStatus: apiStatusConst.failure},
          this.runFailureCount,
        )
      }
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

  getDefaultSearchApi = async () => {
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
      const {categories} = data
      const {items} = categories
      const categoryPlaylistsData = items
      this.setState({
        searchApiStatus: apiStatusConst.success,
        initialData: categoryPlaylistsData,
      })
    } else {
      this.setState(
        {searchApiStatus: apiStatusConst.failure},
        this.runFailureCount,
      )
    }
  }

  onChangeSearch = event => {
    this.setState(
      {
        searchApiStatus: apiStatusConst.loading,
        searchValue: event.target.value,
      },
      this.getSearchContentApi,
    )
  }

  onClickSearch = () => {
    this.setState(
      {
        searchApiStatus: apiStatusConst.loading,
      },
      this.getSearchContentApi,
    )
  }

  onClickSeeAll = () => {
    this.setState(preState => ({isSeeAllEnabled: !preState.isSeeAllEnabled}))
  }

  onClickSeeAllPlaylist = () => {
    this.setState(preState => ({
      isPlaylistSeeAllEnabled: !preState.isPlaylistSeeAllEnabled,
    }))
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
      id: eachTrack.id,
      trackNumber: eachTrack.track_number,
      name: eachTrack.name,
      albumName: eachTrack.album.name,
      duration: eachTrack.duration_ms,
      artist: eachTrack.artists[0].name,
      previewUrl: eachTrack.preview_url,
      images: eachTrack.album.images,
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

  renderPlaylistItem = eachItem => {
    const {id, images, name, tracks} = eachItem
    const imageUrl = images.length === 0 ? '' : images[0].url
    if (id === null || id === undefined || id === '') {
      return null
    }
    return (
      <Link to={`/search/searched-playlist/${id}`} className="each-item-link">
        <li key={id} className="search-result-playlist-item">
          <img
            src={imageUrl}
            className="search-result-playlist-preview"
            alt={name}
          />
          <p className="search-result-playlist-name">{name}</p>
          <p className="search-result-playlist-count text-color-5">
            {this.renderTotalTracks(tracks.total)}
          </p>
        </li>
      </Link>
    )
  }

  renderNoPlaylists = () => (
    <div className="search-result-playlist-no-list">
      <h1 className="search-result-heading-no text-color-5">
        No playlists were found..!
      </h1>
    </div>
  )

  renderNoTracks = () => (
    <div className="search-result-music-no-tracks">
      <h1 className="search-result-heading-no text-color-5">
        No songs were found..!
      </h1>
    </div>
  )

  renderYourMusicTrack = (eachItem, index, items) => (
    <PlayerContext.Consumer>
      {value => {
        const {onAddTrack} = value
        const updatedEachTrack = this.getUpdatedEachTrack(eachItem)
        const onClickSong = () =>
          onAddTrack({...updatedEachTrack, index}, items)

        const {images, artist, id, name} = updatedEachTrack
        const duration = this.getDurationInMins(eachItem.duration_ms)
        const imageUrl = images[0].url

        /*  const {album, artists, id} = eachItem
    const {name} = eachItem
    const previewUrl = eachItem.preview_url
    const duration = this.getDurationInMins(eachItem.duration_ms)

    const {images} = album
    const imageUrl = images.length === 0 ? '' : images[0].url
    const artist =
      artists.length > 1
        ? `${artists[0].name} • ${artists[1].name}`
        : artists[0].name */

        return (
          <li
            key={id}
            className="search-result-music-track"
            onClick={onClickSong}
          >
            <div>
              <div className="search-result-music-track-header">
                {imageUrl === '' ? (
                  <div className="search-result-music-track-no-image">
                    <IoMusicalNotes className="search-result-music-no-image-icon" />
                  </div>
                ) : (
                  <div className="search-result-music-track-image-container">
                    <img
                      src={imageUrl}
                      alt={name}
                      className="search-result-music-track-image"
                    />
                  </div>
                )}
                <div className="search-result-music-track-details">
                  <p className="search-result-music-track-name">{name}</p>
                  <p className="search-result-music-track-artist text-color-5">
                    {artist}
                  </p>
                </div>
              </div>
            </div>
            <p className="search-result-music-track-duration text-color-5">
              {duration}
            </p>
          </li>
        )
      }}
    </PlayerContext.Consumer>
  )

  renderSeeAllTracks = trackItems => {
    let index = 0
    const items = []
    items.push(trackItems[0])
    items.push(trackItems[1])
    items.push(trackItems[2])
    const {isSeeAllEnabled} = this.state

    const modifiedTracksData = trackItems.map(each => ({
      track: {
        name: each.name,
        duration_ms: each.duration_ms,
        artists: each.artists,
        preview_url: each.preview_url,
        album: {
          images: each.album.images,
        },
      },
    }))

    return (
      <>
        {isSeeAllEnabled === false ? (
          <>
            <div className="see-all-container">
              <button
                className="see-all-less-button"
                type="button"
                onClick={this.onClickSeeAll}
              >
                SEE ALL
              </button>
            </div>
            <ul className="search-result-music-tracks">
              {items.map(eachItem => {
                index += 1
                return this.renderYourMusicTrack(
                  eachItem,
                  index,
                  modifiedTracksData,
                )
              })}
            </ul>
          </>
        ) : (
          <>
            <ul className="search-result-music-tracks">
              {trackItems.map(eachItem => {
                index += 1
                return this.renderYourMusicTrack(
                  eachItem,
                  index,
                  modifiedTracksData,
                )
              })}
            </ul>
            <div className="see-less-container">
              <button
                className="see-all-less-button"
                type="button"
                onClick={this.onClickSeeAll}
              >
                SEE LESS
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  renderTracks = trackItems => {
    let index = 0
    const modifiedTracksData = trackItems.map(each => ({
      track: {
        name: each.name,
        duration_ms: each.duration_ms,
        artists: each.artists,
        preview_url: each.preview_url,
        album: {
          images: each.album.images,
        },
      },
    }))
    return (
      <>
        {trackItems.length <= 3 ? (
          <ul className="search-result-music-tracks">
            {trackItems.map(eachItem => {
              index += 1
              return this.renderYourMusicTrack(
                eachItem,
                index,
                modifiedTracksData,
              )
            })}
          </ul>
        ) : (
          this.renderSeeAllTracks(trackItems)
        )}
      </>
    )
  }

  renderSeeAllPlaylists = playlistItems => {
    const items = []
    items.push(playlistItems[0])
    items.push(playlistItems[1])
    items.push(playlistItems[2])
    items.push(playlistItems[3])
    const {isPlaylistSeeAllEnabled} = this.state

    return (
      <>
        {isPlaylistSeeAllEnabled === false ? (
          <>
            <div className="see-all-container">
              <button
                className="see-all-less-button"
                type="button"
                onClick={this.onClickSeeAllPlaylist}
              >
                SEE ALL
              </button>
            </div>
            <ul className="search-result-playlists">
              {items.map(eachItem => this.renderPlaylistItem(eachItem))}
            </ul>
          </>
        ) : (
          <>
            <ul className="search-result-playlists">
              {playlistItems.map(eachItem => this.renderPlaylistItem(eachItem))}
            </ul>
            <div className="see-less-container">
              <button
                className="see-all-less-button"
                type="button"
                onClick={this.onClickSeeAllPlaylist}
              >
                SEE LESS
              </button>
            </div>
          </>
        )}
      </>
    )
  }

  renderPlaylists = playlistItems => (
    <>
      {playlistItems.length <= 4 ? (
        <ul className="search-result-playlists">
          {playlistItems.map(eachItem => this.renderPlaylistItem(eachItem))}
        </ul>
      ) : (
        this.renderSeeAllPlaylists(playlistItems)
      )}
    </>
  )

  renderSearchContent = () => {
    const {fetchedSearchData} = this.state
    const {trackItems, playlistItems} = fetchedSearchData

    const previewUrlFilteredItems = trackItems.filter(each => {
      if (
        each.preview_url === null ||
        each.preview_url === undefined ||
        each.preview_url === ''
      ) {
        return false
      }
      return true
    })

    return (
      <>
        <div className="search-result-songs-main">
          <h1 className="search-result-music-heading">Songs</h1>

          {previewUrlFilteredItems.length === 0
            ? this.renderNoTracks()
            : this.renderTracks(previewUrlFilteredItems)}
        </div>
        <div className="search-result-playlist-main">
          <h1 className="search-result-playlist-heading">Playlists</h1>
          {playlistItems.length === 0
            ? this.renderNoPlaylists()
            : this.renderPlaylists(playlistItems)}
        </div>
      </>
    )
  }

  /* getRandomColor = () => {
    
    const index = Math.floor(Math.random() * colorsArray.length)
    const color = colorsArray[index]
    return color
  } */

  renderSearchDefaultItem = (eachItem, colorIndex) => {
    const {id, name, icons} = eachItem
    const imageUrl = icons[0].url
    // const bgColor = this.getRandomColor()
    const bgColor = colorsArray[colorIndex]
    if (id === null || id === undefined || id === '') {
      return null
    }
    return (
      <Link to={`/search/default-category/${id}`} className="each-item-link">
        <li key={id} className="search-list-item">
          <div
            className="search-list-item-preview"
            style={{backgroundColor: `${bgColor}`}}
          >
            <p className="search-preview-spl-text">{name}</p>
            <img src={imageUrl} alt={name} className="search-preview-spl-img" />
          </div>
        </li>
      </Link>
    )
  }

  renderDefaultSearch = () => {
    const {initialData} = this.state
    let colorIndex = -1
    return (
      <>
        <h1 className="search-default-heading">Explore Our Categories</h1>
        <ul className="search-default-list-container">
          {initialData.map(eachItem => {
            colorIndex += 1
            return this.renderSearchDefaultItem(eachItem, colorIndex)
          })}
        </ul>
      </>
    )
  }

  renderContent = () => {
    const {searchValue} = this.state

    if (searchValue === '') {
      return this.renderDefaultSearch()
    }
    return this.renderSearchContent()
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
    const {searchApiStatus} = this.state
    switch (searchApiStatus) {
      case apiStatusConst.loading:
        return <Loader />
      case apiStatusConst.success:
        return this.renderContent()
      case apiStatusConst.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    const {searchValue} = this.state
    return (
      <div className="search-container">
        <Navbar currentSelected="SEARCH" />
        <div className="search-main-container">
          <div className="search-input-container">
            <input
              type="search"
              placeholder="Songs, or playlists"
              value={searchValue}
              onChange={this.onChangeSearch}
              className="search-input"
            />
            <button type="button" className="search-input-icon-button">
              <BsSearch
                className="search-input-icon"
                onClick={this.onClickSearch}
              />
            </button>
          </div>
          <div className="search-main-content-container">{this.renderUI()}</div>
          <PlayerContext.Consumer>
            {value => <Player value={value} />}
          </PlayerContext.Consumer>
        </div>
      </div>
    )
  }
}

export default Search
