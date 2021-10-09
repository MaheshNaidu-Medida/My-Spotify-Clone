import styled from 'styled-components'

export const LoaderContainer = styled.div`
  background-color: #181818;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
export const LoadingLogo = styled.img`
  width: 120px;
  height: 48px;

  margin-bottom: 10px;
  @media screen and (min-width: 768px) {
    height: 58px;
    width: 144px;
  }
`
export const LoadingText = styled.h1`
  color: #ffffff;
  font-family: 'Roboto';
  font-size: 22px;
  text-align: center;

  @media screen and (min-width: 768px) {
    font-size: 28px;
  }
`
