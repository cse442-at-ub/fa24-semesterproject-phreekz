import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import js-cookie
import './DashboardPage.css'; // Ensure the CSS file is linked properly

const CLIENT_ID = "0a163e79d37245d88d911278ded71526";
const CLIENT_SECRET = "b430a0afd21f43a898466b8963e75f15";
const REDIRECT_URI = "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/sadeedra/#/dashboard";
const SCOPE = "user-read-private user-read-email";

const DashboardPage = () => {
    const [isFriendListCollapsed, setIsFriendListCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState(''); // State to store the username
    const [accessToken, setAccessToken] = useState(''); // Access token to make calls to Spotify API
    const [friendUsername, setFriendUsername] = useState(''); // State for friend username
    const [acceptedFriends, setAcceptedFriends] = useState([]); // Store accepted friends
    const [pendingFriends, setPendingFriends] = useState([]); // Store incoming and outgoing friend requests

    const location = useLocation();
    const auth_code = location.state?.code;

    // Function to toggle friend list collapse
    const toggleFriendList = () => {
        setIsFriendListCollapsed(!isFriendListCollapsed);
    };

    // Fetch the username and friend lists from cookies on component mount
    useEffect(() => {
        const username = Cookies.get('username');
        const acceptedFriendsCookie = Cookies.get('accepted_friends');
        const pendingFriendsCookie = Cookies.get('pending_friends');

        if (username) {
            setCurrentUser(username);
        }
        if (acceptedFriendsCookie) {
            setAcceptedFriends(JSON.parse(acceptedFriendsCookie));
        }
        if (pendingFriendsCookie) {
            setPendingFriends(JSON.parse(pendingFriendsCookie));
        }
    }, []);

    // Handle input change for the friend username field
    const handleInputChange = (e) => {
        setFriendUsername(e.target.value);
    };

    // Function to handle adding a friend
    const addFriend = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        await fetch('/CSE442/2024-Fall/sadeedra/api/sendFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: currentUser,
                following: friendUsername,
            }),
        });

        setFriendUsername(''); // Clear the input field after sending the request
    };

    // Function to accept a friend request
    const acceptFriend = async (follower) => {
        await fetch('/CSE442/2024-Fall/sadeedra/api/acceptFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: follower,
                following: currentUser,
            }),
        });

    // Update UI: remove from pending and add to accepted friends
    setPendingFriends(pendingFriends.filter((friend) => friend.follower !== follower));
    setAcceptedFriends([...acceptedFriends, { following: follower }]);
};


    // Function to deny a friend request
    const denyFriend = async (follower) => {
        await fetch('/CSE442/2024-Fall/sadeedra/api/denyFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: follower,
                following: currentUser,
            }),
        });

        setPendingFriends(pendingFriends.filter((friend) => friend.follower !== follower));
    };

    // Fetch the access token from Spotify API
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
            .then((response) => response.json())
            .then((data) => {
                setAccessToken(data.access_token);
            })
            .catch((error) => {
                console.error('Error fetching the access token:', error);
            });
    }, [auth_code]);

    const getAccessToken = () => {
        window.location.href =
            'https://accounts.spotify.com/authorize?' +
            'response_type=code' +
            '&client_id=' +
            CLIENT_ID +
            '&redirect_uri=' +
            encodeURIComponent(REDIRECT_URI) +
            '&scope=' +
            SCOPE;
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <div className="username-display">👤 {currentUser}</div>
                {!accessToken && (
                    <button className="spotify-login" onClick={getAccessToken}>
                        Log in to Spotify
                    </button>
                )}
                {accessToken && <div className="access-token">Access Token: {accessToken}</div>}
                <button>🎵 Playlist 1</button>
                <button>🎵 Playlist 2</button>
                <button>🎵 Playlist 3</button>
                <Link to="/Account">
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
                    <div className="playlist-card">🎵 Playlist 1</div>
                    <div className="playlist-card">🎵 Playlist 2</div>
                    <div className="playlist-card">🎵 Playlist 3</div>
                </div>
            </div>

            {/* Friend Activity List */}
            <div className={`friend-list ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-btn" onClick={toggleFriendList}>
                    <img src={process.env.PUBLIC_URL + "/images/arrow.png"} alt="Toggle Arrow" />
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
                    <button type="submit" className="add-friend-btn">
                        Add Friend
                    </button>
                </form>

                {/* Display accepted friends */}
                <h3>Friends</h3>
                {acceptedFriends.length > 0 ? (
                    acceptedFriends.map((friend, index) => (
                        <div key={index} className="friend">
                            <p>{friend.following}</p>
                        </div>
                    ))
                ) : (
                    <p>No friends added yet.</p>
                )}

                {/* Display pending friend requests */}
                <h3>Incoming Requests</h3>
                {pendingFriends.length > 0 ? (
                    pendingFriends.map((friend, index) => (
                        <div key={index} className="friend">
                            <p>{friend.follower ? friend.follower : friend.following} wants to connect</p>
                            <button onClick={() => acceptFriend(friend.follower || friend.following)}>Accept</button>
                            <button onClick={() => denyFriend(friend.follower || friend.following)}>Deny</button>
                        </div>
                    ))
                ) : (
                    <p>No pending requests.</p>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;