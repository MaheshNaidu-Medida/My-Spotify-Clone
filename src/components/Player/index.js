import {
  AiFillPlayCircle,
  AiFillPauseCircle,
  AiFillStepBackward,
  AiFillStepForward,
} from 'react-icons/ai'
import {BsPauseFill, BsPlayFill, BsToggleOff, BsToggleOn} from 'react-icons/bs'
import {HiVolumeUp} from 'react-icons/hi'
import {SiApplemusic} from 'react-icons/si'
import {BiSkipPrevious} from 'react-icons/bi'
import {IoPlaySkipForwardCircle, IoVolumeMuteSharp} from 'react-icons/io5'
import PlayerContext from '../../context/PlayerContext'
import './index.css'

const Player = () => (
  <PlayerContext.Consumer>
    {value => {
      const {
        initialState,
        currentSongData,
        totalDuration,
        currentDuration,
        currentVolume,
        isLoading,
        isPlaying,
        isMuted,
        onTogglePlay,
        onClickNext,
        onClickPrevious,
        onChangeDuration,
        onChangeVolume,
        onClickMute,
        onToggleEnvironment,
      } = value
      const {name, artist, images, duration} = currentSongData
      const onClickPlayPause = () => {
        onTogglePlay()
      }

      const onClickNextSong = () => {
        onClickNext()
      }
      const onClickPreviousSong = () => {
        onClickPrevious()
      }

      const onChangeSongDuration = event => {
        onChangeDuration(event.target.value)
      }

      const onChangeSongVolume = event => {
        onChangeVolume(event.target.value)
      }

      const onClickMuteButton = () => onClickMute()

      const onClickStateToggle = () => onToggleEnvironment()

      const getDurationInMins = time => {
        const durationInSec = Math.floor(time % 60)
        const durationInMin = Math.floor(time / 60)

        if (durationInSec < 10) {
          return `${durationInMin}:0${durationInSec}`
        }
        return `${durationInMin}:${durationInSec}`
      }

      return (
        <div className="player">
          <div className="player-details">
            {images === undefined ||
            images === null ||
            images.length === 0 ||
            images[0].url === '' ? (
              <div className="player-preview-no-image">
                <SiApplemusic className="player-no-image-icon" />
              </div>
            ) : (
              <div>
                <img
                  src={images[0].url}
                  alt="song"
                  className="player-preview-image"
                />
              </div>
            )}
            <div className="player-title-details">
              <p p className="player-track-name">
                {name === '' || name === undefined || name === null
                  ? 'Song'
                  : name}
              </p>
              <p className="player-track-artist">
                {artist === undefined || artist === null || artist === ''
                  ? 'Artists'
                  : artist}
              </p>
            </div>
          </div>
          <div className="player-large-devices">
            <div className="slider-control-container">
              <div className="previous-container-large">
                <BiSkipPrevious
                  onClick={onClickPreviousSong}
                  className="previous-icon-large"
                />
              </div>
              {isPlaying ? (
                <AiFillPauseCircle
                  onClick={onClickPlayPause}
                  className="play-pause-icon-large"
                />
              ) : (
                <AiFillPlayCircle
                  onClick={onClickPlayPause}
                  className="play-pause-icon-large"
                />
              )}

              <IoPlaySkipForwardCircle
                className="play-pause-icon-large"
                onClick={onClickNextSong}
              />

              {initialState ? (
                <BsToggleOn
                  className="player-state-toggle-on"
                  onClick={onClickStateToggle}
                />
              ) : (
                <BsToggleOff
                  className="player-state-toggle-off"
                  onClick={onClickStateToggle}
                />
              )}
              <p className="player-duration-details">
                {getDurationInMins(currentDuration)}/
              </p>
              <p className="player-duration-details">
                {initialState
                  ? getDurationInMins(duration)
                  : getDurationInMins(30)}
              </p>
              <input
                type="range"
                min="0"
                max={initialState ? duration : '30'}
                step="0.01"
                value={
                  currentDuration === undefined ||
                  currentDuration === null ||
                  currentDuration === ''
                    ? '0'
                    : currentDuration
                }
                onChange={onChangeSongDuration}
                className="player-slider-large"
              />
            </div>
            <div className="volume-control-container">
              {isMuted ? (
                <IoVolumeMuteSharp
                  className="player-volume-icon-large"
                  onClick={onClickMuteButton}
                />
              ) : (
                <HiVolumeUp
                  className="player-volume-icon-large"
                  onClick={onClickMuteButton}
                />
              )}
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.001"
                value={
                  currentVolume === undefined ||
                  currentVolume === null ||
                  currentVolume === ''
                    ? '0.5'
                    : currentVolume
                }
                onChange={onChangeSongVolume}
                className="player-volume-slider"
              />
            </div>
          </div>

          <div className="player-small-devices">
            <AiFillStepBackward
              className="play-pause-icon-small"
              onClick={onClickPreviousSong}
            />
            {isPlaying ? (
              <BsPauseFill
                onClick={onClickPlayPause}
                className="play-pause-icon-small"
              />
            ) : (
              <BsPlayFill
                onClick={onClickPlayPause}
                className="play-pause-icon-small"
              />
            )}
            <AiFillStepForward
              className="play-pause-icon-small"
              onClick={onClickNextSong}
            />
            {initialState ? (
              <BsToggleOn
                className="player-state-toggle-on"
                onClick={onClickStateToggle}
              />
            ) : (
              <BsToggleOff
                className="player-state-toggle-off"
                onClick={onClickStateToggle}
              />
            )}
          </div>
          <input
            type="range"
            min="0"
            max={initialState ? duration : '30'}
            step="0.01"
            value={
              currentDuration === undefined ||
              currentDuration === null ||
              currentDuration === ''
                ? '0'
                : currentDuration
            }
            onChange={onChangeSongDuration}
            className="player-slider-small"
          />
        </div>
      )
    }}
  </PlayerContext.Consumer>
)
export default Player
