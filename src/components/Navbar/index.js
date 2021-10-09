import {Component} from 'react'
import {Link} from 'react-router-dom'
import {FaUser} from 'react-icons/fa'
import {AiFillHome} from 'react-icons/ai'
import {IoMusicalNotes, IoClose} from 'react-icons/io5'
import {BsMusicNoteList} from 'react-icons/bs'
import {GiHamburgerMenu} from 'react-icons/gi'
import {HiSearch} from 'react-icons/hi'

import './index.css'

class Navbar extends Component {
  state = {
    isNoMenuSelected: true,
  }

  onToggleNavbar = () => {
    this.setState(prevState => ({
      isNoMenuSelected: !prevState.isNoMenuSelected,
    }))
  }

  renderNavbarDesktop = () => {
    const {currentSelected} = this.props
    const menuItemColor = 'link-item-menu-current'

    return (
      <nav className="navbar-desktop">
        <Link to="/" className="link-item">
          <img
            src="/img/logo.png"
            alt="website logo"
            className="navbar-desktop-logo"
          />
        </Link>
        <div className="navbar-desktop-main">
          <div className="navbar-desktop-menu">
            <Link
              to="/profile"
              className={`link-item-menu-icon ${
                currentSelected === 'PROFILE' ? menuItemColor : ''
              }`}
            >
              <FaUser className="navbar-desktop-icon" />
              <p className="navbar-desktop-icon-text">Profile</p>
            </Link>
            <Link
              to="/"
              className={`link-item-menu-icon ${
                currentSelected === 'HOME' ? menuItemColor : ''
              }`}
            >
              <AiFillHome className="navbar-desktop-icon" />
              <p className="navbar-desktop-icon-text">Home</p>
            </Link>
            <Link
              to="/your-music"
              className={`link-item-menu-icon ${
                currentSelected === 'YOUR_MUSIC' ? menuItemColor : ''
              }`}
            >
              <IoMusicalNotes className="navbar-desktop-icon" />
              <p className="navbar-desktop-icon-text">Your Music</p>
            </Link>
            <Link
              to="/your-playlists"
              className={`link-item-menu-icon ${
                currentSelected === 'PLAYLISTS' ? menuItemColor : ''
              }`}
            >
              <BsMusicNoteList className="navbar-desktop-icon" />
              <p className="navbar-desktop-icon-text">Playlists</p>
            </Link>
            <Link
              to="/search"
              className={`link-item-menu-icon ${
                currentSelected === 'SEARCH' ? menuItemColor : ''
              }`}
            >
              <HiSearch className="navbar-desktop-icon" />
              <p className="navbar-desktop-icon-text">Search</p>
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  renderNavbarMobileNoMenu = () => (
    <div className="navbar-mobile-no-menu">
      <Link to="/" className="link-item-mobile">
        <img
          src="/img/logo.png"
          className="navbar-mobile-logo"
          alt="navbar logo"
        />
      </Link>
      <button type="button" className="navbar-button">
        <GiHamburgerMenu
          className="navbar-mobile-icon"
          onClick={this.onToggleNavbar}
        />
      </button>
    </div>
  )

  renderNavbarMobileMenu = () => (
    <div className="navbar-mobile-menu">
      <Link to="/profile" className="link-item-mobile">
        <FaUser className="navbar-mobile-icon" />
      </Link>
      <Link to="/" className="link-item-mobile">
        <AiFillHome className="navbar-mobile-icon" />
      </Link>
      <Link to="/your-music" className="link-item-mobile">
        <IoMusicalNotes className="navbar-mobile-icon" />
      </Link>
      <Link to="/your-playlists" className="link-item-mobile">
        <BsMusicNoteList className="navbar-mobile-icon" />
      </Link>
      <Link to="/search" className="link-item-mobile">
        <HiSearch className="navbar-mobile-icon" />
      </Link>
      <button type="button" className="navbar-button">
        <IoClose className="navbar-mobile-icon" onClick={this.onToggleNavbar} />
      </button>
    </div>
  )

  renderNavbarMobile = () => {
    const {isNoMenuSelected} = this.state
    return (
      <nav className="navbar-mobile">
        {isNoMenuSelected
          ? this.renderNavbarMobileNoMenu()
          : this.renderNavbarMobileMenu()}
      </nav>
    )
  }

  renderResponsiveNavbar = () => (
    <div className="navbar-container">
      {this.renderNavbarMobile()}
      {this.renderNavbarDesktop()}
    </div>
  )

  render() {
    return this.renderResponsiveNavbar()
  }
}

export default Navbar
