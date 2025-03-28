import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import DOMPurify from 'dompurify';
import './DashboardPage.css';

const USER = process.env.REACT_APP_USER;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
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
    const [errorMessage, setErrorMessage] = useState(''); // Error message state for form validation
    const [theme, setTheme] = useState('dark'); // New state for theme

    const location = useLocation();
    const auth_code = location.state?.code;
    const access_token = location.state?.access_token;
    const navigate = useNavigate();

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Save to localStorage
    };

    const toggleFriendList = () => {
        setIsFriendListCollapsed(!isFriendListCollapsed);
    };

    // Load friend data from cookies on component mount
    useEffect(() => {
        // Fetch CSRF token on page load
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch(`/CSE442/2024-Fall/${USER}/api/csrfToken.php`);
                const data = await response.json();
                setCsrfToken(data.csrf_token);
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
            }
        };

        fetchCsrfToken();

        // Load theme from localStorage on initial load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) setTheme(savedTheme);

        const username = Cookies.get('username');
        const acceptedFriendsCookie = Cookies.get('accepted_friends');
        const pendingSentFriendsCookie = Cookies.get('pending_sent_friends');
        const pendingReceivedFriendsCookie = Cookies.get('pending_received_friends');
        const accessTokenCookie = Cookies.get('access_token');

        if (username) {
            setCurrentUser(username);
        } else {
            navigate('/');
        }
        if (acceptedFriendsCookie) setAcceptedFriends(JSON.parse(acceptedFriendsCookie));
        if (pendingSentFriendsCookie) setPendingSentFriends(JSON.parse(pendingSentFriendsCookie));
        if (pendingReceivedFriendsCookie) setPendingReceivedFriends(JSON.parse(pendingReceivedFriendsCookie));
        if (accessTokenCookie) {
            setAccessToken(accessTokenCookie);
        } else {
            setAccessToken(access_token);
            // Cookies.set('access_token', access_token, { expires: 1 }); // secure: true
        }
    }, []);

    // Input change handler with validation for potential injection attempts
    const handleInputChange = (e) => {
        const value = e.target.value;

        // Check for HTML injection attempt
        if (value.includes("<script>")) {
            setErrorMessage("Invalid username format.");
            return;
        }

        // Check for SQL injection attempt
        const sqlInjectionPattern = /(\bDROP\b|\bSELECT\b|\bDELETE\b|\bINSERT\b)/i;
        if (sqlInjectionPattern.test(value)) {
            setErrorMessage("Invalid username format.");
            return;
        }

        setFriendUsername(value);
        setErrorMessage('');
    };

    const acceptFriend = async (follower) => {
        const response = await fetch(`/CSE442/2024-Fall/${USER}/api/acceptFriendRequest.php`, {
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
        const response = await fetch(`/CSE442/2024-Fall/${USER}/api/denyFriendRequest.php`, {
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
        if(!auth_code) {
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
                Cookies.set('access_token', data.access_token, { expires: 1 }); // secure: true
            })
            .catch(error => {
                console.error('Error fetching the access token:', error);
            });
    }, []);

    // Fetch Spotify User ID
    // Set users Spotify ID if its not yet set
    // Has to run every time the access token changes because it has to be set initially when the user
    // first logs in to Spotify. Every time this block runs, it should check first to see if the user
    // display name has been set already. If not, it should fetch the user ID from Spotify and set it.
    useEffect(() => {
        // Can't run if no access token, so return
        if (!accessToken) {
            return;
        }
        // Get Spotify user ID from Spotify web API
        fetch('https://api.spotify.com/v1/me', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                // Set Spotify display name in the database
                fetch(`/CSE442/2024-Fall/${USER}/api/setUserID.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: currentUser,
                        spotify_id: data.id,
                    }),
                })
                    .then(response => {
                        if (response.ok) {
                            console.log('Spotify ID set successfully');
                        } else {
                            console.error('Error setting Spotify ID:', response.statusText);
                        }
                    })
            })
            .catch(error => console.error('Error setting Spotify user ID:', error));
    }, [accessToken]);

    const getAccessToken = async () => {
        try {
            // Validate CSRF token before redirecting to Spotify
            const response = await fetch(`/CSE442/2024-Fall/${USER}/api/verifyCsrfToken.php`, {
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
        if (Cookies.get('access_token') === undefined) {
            alert('Please log in to Spotify first');
            return;
        }
        // Validate CSRF token before redirecting to Playlist Page
        const response = await fetch(`/CSE442/2024-Fall/${USER}/api/verifyCsrfToken.php`, {
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
        const response = await fetch(`/CSE442/2024-Fall/${USER}/api/sendFriendRequest.php`, {
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

    const goToExplorePage = () => {
        if (Cookies.get('access_token') === undefined) {
            alert('Please log in to Spotify first');
            return;
        }
        navigate('/explore', { state: { accessToken } }); // Pass the accessToken to ExplorePage
    };

    function deleteCookie(name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    const handleLogout = () => {
        deleteCookie("remember_me"); // Delete the remember_me cookie
        console.log("Cookie 'remember_me' deleted");
        deleteCookie("username");
        console.log("Cookie 'username' deleted");
    }

    return (
        <div className={`dashboard-container ${theme}-theme`}>
            <div className={`dashboard-sidebar ${theme}-theme`}>
                <div className="username-display">
                    👤 {DOMPurify.sanitize(currentUser)}
                </div>
                {/* Theme toggle button */}
                <button className="theme-toggle-button" onClick={toggleTheme}>
                    <img src={process.env.PUBLIC_URL + `/images/${theme === 'dark' ? 'light' : 'dark'}.png`}
                        alt={`${theme === 'dark' ? 'Light' : 'Dark'} Mode`} />
                </button>
                {!accessToken && (
                    <button className="spotify-login" onClick={getAccessToken}>
                        Log in to Spotify
                    </button>
                )}
                {accessToken && <div className="access-token">Access Token: {accessToken}</div>}
                <button>🎵 Playlist 1</button>
                <button>🎵 Playlist 2</button>
                <button>🎵 Playlist 3</button>
                <button onClick={goToPlaylistsPage}>View Spotify Playlists</button> {/* Button to navigate to playlists */}
                <button onClick={goToExplorePage}>🔍 Explore</button>
                <Link to="/account">
                    <button>
                        <div className="gear">
                            <img src={process.env.PUBLIC_URL + "/images/setting_gear.png"} alt="Settings" />
                        </div>
                    </button>
                </Link>
                <Link to="/" onClick={handleLogout}>
                    <button>Log out</button>
                </Link>
            </div>

            <div className="dashboard-main-content">
                <h2>Charts</h2>
                <div className="dashboard-charts">
                    <div className="dashboard-chart-card">
                        <div className="dashboard-chart-circle">
                            <h3>This Week Wrapped</h3>
                        </div>
                        <p>Ice Spice 56%</p>
                        <p>Yuno Miles 28%</p>
                        <p>Mozart 11%</p>
                        <p>Mayo Boy 5%</p>
                    </div>

                    <div className="dashboard-chart-card">
                        <div className="dashboard-chart-circle">
                            <h3>Top Artists</h3>
                        </div>
                        <p>Ice Spice 56%</p>
                        <p>Yuno Miles 28%</p>
                        <p>Mozart 11%</p>
                        <p>Mayo Boy 5%</p>
                    </div>

                    <div className="dashboard-chart-card">
                        <div className="dashboard-chart-circle">
                            <h3>Top Songs</h3>
                        </div>
                        <p>Deli by Ice Spice 56%</p>
                        <p>Munch (Feelin' U) by Ice Spice 28%</p>
                        <p>Martin Luther by Yuno Miles 11%</p>
                        <p>Honey Bun by Yuno Miles 5%</p>
                    </div>
                </div>

                <h2>Your Playlists</h2>
                <div className="dashboard-playlists">
                    <div className="dashboard-playlist-card">🎵 Playlist 1</div>
                    <div className="dashboard-playlist-card">🎵 Playlist 2</div>
                    <div className="dashboard-playlist-card">🎵 Playlist 3</div>
                </div>
            </div>

            <div className={`dashboard-friend-list ${theme}-theme ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-btn" onClick={toggleFriendList}>
                    <img src={process.env.PUBLIC_URL + "/images/arrow.png"} alt="Toggle Arrow" />
                </button>
                <div className={`dashboard-friend-activity-title ${theme}-theme`}>Friend Activity</div>

                <form onSubmit={addFriend} className="add-friend-form">
                    <input
                        type="text"
                        className="friend-input"
                        placeholder="Add a friend..."
                        value={friendUsername}
                        onChange={handleInputChange}
                    />
                    <button type="submit" className="dashboard-add-friend-btn">
                        Add Friend
                    </button>
                </form>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <h3>Friends</h3>
                {acceptedFriends.length > 0 ? (
                    acceptedFriends.map((friend, index) => (
                        <div key={index} className={`dashboard-friend ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                            {isFriendListCollapsed ? (
                                <p>{friend.following.charAt(0).toUpperCase()}</p> // Display initial when collapsed
                            ) : (
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(friend.following),
                                    }}
                                ></p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No friends added yet.</p>
                )}

                {/* <h3>Incoming Requests</h3>
                {pendingReceivedFriends.length > 0 ? (
                    pendingReceivedFriends.map((friend, index) => (
                        <div key={index} className={`dashboard-pending-request ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                            {isFriendListCollapsed ? (
                                <p>{friend.follower.charAt(0).toUpperCase()}</p> // Display initial when collapsed
                            ) : (
                                <p
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(`${friend.follower} wants to connect`),
                                    }}
                                ></p>
                            )}
                            {!isFriendListCollapsed && (
                                <>
                                    <button onClick={() => acceptFriend(friend.follower)}>Accept</button>
                                    <button onClick={() => denyFriend(friend.follower)}>Deny</button>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    !isFriendListCollapsed && <p>No pending requests.</p>
                )} */}
                <h3 className="dashboard-incoming-requests-title">Incoming Requests</h3>
                {pendingReceivedFriends.length > 0 ? (
                    pendingReceivedFriends.map((friend, index) => (
                        <div key={index} className="dashboard-pending-request">
                            <p>{friend.follower} wants to connect</p>
                            <button onClick={() => acceptFriend(friend.follower)}>Accept</button>
                            <button onClick={() => denyFriend(friend.follower)}>Deny</button>
                        </div>
                    ))
                ) : (
                    <p className="dashboard-no-pending-requests">No pending requests.</p>
                )}

            </div>
        </div>
    );

};

export default DashboardPage;