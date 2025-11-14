import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import homeIcon from './assets/home.svg';
import playlistIcon from './assets/playlist.svg';
import accountIcon from './assets/account.svg';
import logo from './assets/logo.png';

const navLinkStyles = ({ isActive }) => ({
    backgroundColor: isActive ? '#F4C3A4' : 'transparent',
    borderWidth: isActive ? '2px 0px 2px 2px' : "2px 0px 2px 2px",
    borderStyle: 'solid',
    borderColor: isActive ? '#000000' : 'transparent',
})

function Home() {
    return <h1>home test</h1>
}
function Playlist() {
    return <h1>playlist test</h1>
}
function Account() {
    return <h1>account test</h1>
}



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div id="main"> {/* main container */}
        <BrowserRouter>

          <nav>                                           {/*side navigation bar - used for routing with NavLink and specified routes */}                                    
            <img src={logo} alt="The Queue Logo" />       {/* calling components with return into the feed element*/}
            <NavLink to = "/" style={navLinkStyles}>
              <img src={homeIcon} alt="home icon"/>
              Home    
            </NavLink>
            <NavLink to = "/create-playlist" style={navLinkStyles}>
              <img src={playlistIcon} alt="playlist icon"/>
              Create Playlist  
            </NavLink>
            <NavLink to = "/account" style={navLinkStyles}>
              <img src={accountIcon} alt="account icon"/>
              Account  
            </NavLink>
          </nav> 

          <div id="feed">
            <Routes>
              <Route path='/' element = {<Home />} ></Route>
              <Route path='/create-playlist' element = {<Playlist />} ></Route>
              <Route path='/account' element = {<Account />}> </Route> 
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
