import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added useNavigate
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';
import './DashboardPage.css';

const CLIENT_ID = "0a163e79d37245d88d911278ded71526";
const CLIENT_SECRET = "b430a0afd21f43a898466b8963e75f15";
const REDIRECT_URI = "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/yichuanp/#/dashboard";
const SCOPE = "user-read-private user-read-email";

const DashboardPage = () => {
    const [isFriendListCollapsed, setIsFriendListCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [friendUsername, setFriendUsername] = useState(''); // State for friend username
    const location = useLocation();
    const auth_code = location.state?.code;
    const navigate = useNavigate(); // Added useNavigate for navigation

    // Function to toggle friend list collapse
    const toggleFriendList = () => {
        setIsFriendListCollapsed(!isFriendListCollapsed);
    };

    // Fetch the username from the cookie on component mount
    useEffect(() => {
        const username = Cookies.get('username');
        if (username) {
            setCurrentUser(username);
        }
    }, []);

    // Get an access token from Spotify API
    useEffect(() => {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: auth_code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        });

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        })
        .then(response => response.json())
        .then(data => {
            setAccessToken(data.access_token);
        })
        .catch(error => {
            console.error('Error fetching the access token:', error);
        });
    }, [auth_code]);

    const getAccessToken = () => {
        window.location.href = 'https://accounts.spotify.com/authorize?' 
        + "response_type=code"
        + "&client_id=" + CLIENT_ID
        + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI)
        + "&scope=" + SCOPE;
    };

    // Handle input change for the friend username field
    const handleInputChange = (e) => {
        setFriendUsername(e.target.value);
    };

    // Function to handle adding a friend
    const addFriend = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate if input is malicious
        const sanitizedInput = DOMPurify.sanitize(e.target.value)

        // Alert thrown when malicious input detected
        if (sanitizedInput != e.target.value) {
            alert('Malicious Input Detected. Enter a different username')
            return;
        }

        // Send follower and following data to friend.php
        await fetch('friend.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: currentUser, // Send the current user's username
                following: friendUsername, // Send the username to follow
            }),
        });

        setFriendUsername(''); // Clear the input field after sending the request
    };

    // Function to navigate to Playlists page
    const goToPlaylistsPage = () => {
        navigate('/playlists', { state: { accessToken } }); // Pass accessToken to PlaylistsPage
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <div className="username-display">👤 {currentUser}</div>
                {!accessToken && <button className="spotify-login" onClick={getAccessToken}>Log in to Spotify</button>}
                {accessToken && <div className="access-token">Access Token: {accessToken}</div>}
                <button>🎵 Playlist 1</button>
                <button>🎵 Playlist 2</button>
                <button>🎵 Playlist 3</button>
                <button onClick={goToPlaylistsPage}>View Spotify Playlists</button> {/* Button to navigate to playlists */}
                <Link to="/account">
                    <button>
                        <div className="gear">
                            <img src={process.env.PUBLIC_URL + "/images/setting_gear.png"} alt="Settings" />
                        </div>
                    </button>
                </Link>
            </div>

            {/* Main content area */}
            <div className="main-content">
                <h2>Charts</h2>
                <div className="charts">
                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>This Week Wrapped</h3>
                        </div>
                        <p>Ice Spice 56%</p>
                        <p>Yuno Miles 28%</p>
                        <p>Mozart 11%</p>
                        <p>Mayo Boy 5%</p>
                    </div>

                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>Top Artists</h3>
                        </div>
                        <p>Ice Spice 56%</p>
                        <p>Yuno Miles 28%</p>
                        <p>Mozart 11%</p>
                        <p>Mayo Boy 5%</p>
                    </div>

                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>Top Songs</h3>
                        </div>
                        <p>Deli by Ice Spice 56%</p>
                        <p>Munch (Feelin' U) by Ice Spice 28%</p>
                        <p>Martin Luther by Yuno Miles 11%</p>
                        <p>Honey Bun by Yuno Miles 5%</p>
                    </div>
                </div>

                <h2>Your Playlists</h2>
                <div className="playlists">
                    <div className="playlist-card">
                        🎵 Playlist 1
                    </div>
                    <div className="playlist-card">
                        🎵 Playlist 2
                    </div>
                    <div className="playlist-card">
                        🎵 Playlist 3
                    </div>
                </div>
            </div>

            {/* Friend Activity List */}
            <div className={`friend-list ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-btn" onClick={toggleFriendList}>
                    <img
                        src={process.env.PUBLIC_URL + "/images/arrow.png"}
                        alt="Toggle Arrow"
                    />
                </button>
                <div className="friend-activity-title">Friend Activity</div>
                {/* Friend input form */}
                <form onSubmit={addFriend} className="add-friend-form">
                    <input
                        type="text"
                        className="friend-input"
                        placeholder="Add a friend..."
                        value={friendUsername}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="add-friend-btn">Add Friend</button>
                </form>
            </div>
        </div>
    );
};

export default DashboardPage;