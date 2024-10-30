import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';
import './DashboardPage.css';

const CLIENT_ID = "0a163e79d37245d88d911278ded71526";
const CLIENT_SECRET = "b430a0afd21f43a898466b8963e75f15";
const REDIRECT_URI = "https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/slogin/#/dashboard";
const SCOPE = "user-read-private user-read-email";

const DashboardPage = () => {
    const [isFriendListCollapsed, setIsFriendListCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState(''); 
    const [accessToken, setAccessToken] = useState(''); 
    const [friendUsername, setFriendUsername] = useState(''); 
    const [acceptedFriends, setAcceptedFriends] = useState([]); 
    const [pendingSentFriends, setPendingSentFriends] = useState([]); 
    const [pendingReceivedFriends, setPendingReceivedFriends] = useState([]); 
    const [csrfToken, setCsrfToken] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); // For success message

    const location = useLocation();
    const auth_code = location.state?.code;
    const navigate = useNavigate();

    const toggleFriendList = () => {
        setIsFriendListCollapsed(!isFriendListCollapsed);
    };

    useEffect(() => {
        // Fetch CSRF token on page load
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/CSE442/2024-Fall/yichuanp/api/csrfToken.php');
                const data = await response.json();
                setCsrfToken(data.csrf_token);
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
            }
        };
        fetchCsrfToken();
    }, []);

    // Load friend data from cookies on component mount
    useEffect(() => {
        const username = Cookies.get('username');
        const acceptedFriendsCookie = Cookies.get('accepted_friends');
        const pendingSentFriendsCookie = Cookies.get('pending_sent_friends');
        const pendingReceivedFriendsCookie = Cookies.get('pending_received_friends');
        const accessTokenCookie = Cookies.get('access_token');
        
        if (username) setCurrentUser(username);
        if (acceptedFriendsCookie) setAcceptedFriends(JSON.parse(acceptedFriendsCookie));
        if (pendingSentFriendsCookie) setPendingSentFriends(JSON.parse(pendingSentFriendsCookie));
        if (pendingReceivedFriendsCookie) setPendingReceivedFriends(JSON.parse(pendingReceivedFriendsCookie));
        if (accessTokenCookie) setAccessToken(accessTokenCookie);
    }, []);

    const handleInputChange = (e) => {
        setFriendUsername(e.target.value);
    };

    const addFriend = async (e) => {
        e.preventDefault();

        await fetch('/CSE442/2024-Fall/slogin/api/sendFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: currentUser,
                following: friendUsername,
            }),
        });

        setFriendUsername('');
    };

    const acceptFriend = async (follower) => {
        await fetch('/CSE442/2024-Fall/slogin/api/acceptFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: follower,
                following: currentUser,
            }),
        });

        const responseData = await response.json(); // Parse JSON response

        if (response.ok) {
            setSuccessMessage('Friend Successfully Accepted!');
        } else if (response.status == 406) {
            alert('Error validating CSRF Token. Please log in again.')
        } else {
            setSuccessMessage(`Failed to save changes: ${responseData.message}`);
        }

        setPendingReceivedFriends(pendingReceivedFriends.filter((friend) => friend.follower !== follower));
        setAcceptedFriends([...acceptedFriends, { following: follower }]);
    };

    const denyFriend = async (follower) => {
        await fetch('/CSE442/2024-Fall/slogin/api/denyFriendRequest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: follower,
                following: currentUser,
            }),
        });

        const responseData = await response.json(); // Parse JSON response

        if (response.ok) {
            setSuccessMessage('Friend Successfully Denied!');
        } else if (response.status == 406) {
            alert('Error validating CSRF Token. Please log in again.')
        } else {
            setSuccessMessage(`Failed to save changes: ${responseData.message}`);
        }

        setPendingReceivedFriends(pendingReceivedFriends.filter((friend) => friend.follower !== follower));
    };

    // Fetch Spotify access token
    useEffect(() => {
        if(Cookies.get('access_token') != 'undefined') {
            return;
        }
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
            Cookies.set('access_token', data.access_token, { secure: true, expires: 1 });
        })
        .catch(error => {
            console.error('Error fetching the access token:', error);
        });
        
    }, [auth_code]);

    const getAccessToken = async () => {
        try {
            // Validate CSRF token before redirecting to Spotify
            const response = await fetch('/CSE442/2024-Fall/yichuanp/api/verifyCsrfToken.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken, // Send the CSRF token in the header
                },
                body: JSON.stringify({ action: 'spotify_login' }) // Optional body if needed for other validation
            });

            if (response.ok) {
                // If CSRF token is valid, proceed to redirect to Spotify
                window.location.href = 'https://accounts.spotify.com/authorize?'
                    + "response_type=code"
                    + "&client_id=" + CLIENT_ID
                    + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI)
                    + "&scope=" + SCOPE;
            } else {
                // Handle CSRF token validation failure
                alert('Invalid CSRF token. Please refresh the page and try again.');
            }
        } catch (error) {
            console.error('Error validating CSRF token:', error);
            alert('An error occurred. Please try again later.');
        }
    };



    const goToPlaylistsPage = async () => {

        // Validate CSRF token before redirecting to Playlist Page
        const response = await fetch('/CSE442/2024-Fall/yichuanp/api/verifyCsrfToken.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken, // Send the CSRF token in the header
            }        
        });

        const responseData = await response.json(); // Parse JSON response

        if (response.ok) {
            navigate('/playlists', { state: { accessToken } });
        } else if (response.status == 406) {
            alert('Error validating CSRF Token. Please log in again.')
        } else {
            setSuccessMessage(`Failed to save changes: ${responseData.message}`);
        }
    }

    // Handle input change for the friend username field
    const handleInputChange = (e) => {
        setFriendUsername(e.target.value);
    };

    // Function to handle adding a friend
    const addFriend = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        // Validate if input is malicious
        const sanitizedInput = DOMPurify.sanitize(friendUsername)

        // Alert thrown when malicious input detected
        if (sanitizedInput != friendUsername) {
            alert('Malicious Input Detected. Enter a different username')
            return;
        }

        // Send follower and following data to friend.php
        const response = await fetch('/CSE442/2024-Fall/yichuanp/api/sendFriendRequest.php', {            
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                follower: currentUser, // Send the current user's username
                following: friendUsername, // Send the username to follow
            }),
        });

        const responseData = await response.json(); // Parse JSON response

        if (response.ok) {
            setSuccessMessage('Friend Request Sent Successfully!');
        } else if (response.status == 406) {
            alert('Error validating CSRF Token. Please log in again.')
        } else {
            setSuccessMessage(`Failed to save changes: ${responseData.message}`);
        }

        setFriendUsername(''); // Clear the input field after sending the request
    };
    
    return (
        <div className="dashboard-container">
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
                <button onClick={goToPlaylistsPage}>View Spotify Playlists</button>
                <Link to="/account">
                    <button>
                        <div className="gear">
                            <img src={process.env.PUBLIC_URL + "/images/setting_gear.png"} alt="Settings" />
                        </div>
                    </button>
                </Link>
            </div>

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

            <div className={`friend-list ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-btn" onClick={toggleFriendList}>
                    <img src={process.env.PUBLIC_URL + "/images/arrow.png"} alt="Toggle Arrow" />
                </button>
                <div className="friend-activity-title">Friend Activity</div>

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

                <h3>Incoming Requests</h3>
                {pendingReceivedFriends.length > 0 ? (
                    pendingReceivedFriends.map((friend, index) => (
                        <div key={index} className="friend">
                            <p>{friend.follower} wants to connect</p>
                            <button onClick={() => acceptFriend(friend.follower)}>Accept</button>
                            <button onClick={() => denyFriend(friend.follower)}>Deny</button>
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
