import {LoaderContainer, LoadingLogo, LoadingText} from './styledComponent'

const Loader = () => (
  <LoaderContainer className="loader-container">
    <LoadingLogo
      //     src="https://assets.ccbp.in/frontend/react-js/spotify-remix-login-music.png"
      src="https://res.cloudinary.com/maheshnaiducloudinary/image/upload/v1633941997/My%20Spotify%20Clone/My%20Spotify%20Logo/My_Spotify_Logo_s05z7j.png"
      alt="loading logo"
      className="loading-logo"
    />
    <LoadingText className="loading-text">Loading...</LoadingText>
  </LoaderContainer>
)
export default Loader
