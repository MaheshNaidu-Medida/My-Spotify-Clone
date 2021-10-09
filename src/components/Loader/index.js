import {LoaderContainer, LoadingLogo, LoadingText} from './styledComponent'

const Loader = () => (
  <LoaderContainer className="loader-container">
    <LoadingLogo
      src="/img/logo.png"
      alt="loading logo"
      className="loading-logo"
    />
    <LoadingText className="loading-text">Loading...</LoadingText>
  </LoaderContainer>
)
export default Loader
