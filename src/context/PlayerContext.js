import React from 'react'

const PlayerContext = React.createContext({
  initialState: true,
  currentSongData: {},
  onAddTrack: () => {},
  isPlaying: false,
  isMuted: false,
  onTogglePlay: () => {},
  totalDuration: '',
  currentDuration: '',
  onChangeDuration: () => {},
  currentVolume: '',
  onChangeVolume: () => {},
  onClickNext: () => {},
  onClickPrevious: () => {},
  onClickMute: () => {},
})
export default PlayerContext
