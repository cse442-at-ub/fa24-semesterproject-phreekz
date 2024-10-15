import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie
import './DashboardPage.css'; // Ensure the CSS file is linked properly

const DashboardPage = () => {
    const [isFriendListCollapsed, setIsFriendListCollapsed] = useState(false);
    const [currentUser, setCurrentUser] = useState('');
    const [friendUsername, setFriendUsername] = useState(''); // State for friend username

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

    // Handle input change for the friend username field
    const handleInputChange = (e) => {
        setFriendUsername(e.target.value);
    };

    // Function to handle adding a friend
    const addFriend = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

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

    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <div className="username-display">👤 {currentUser}</div>
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
