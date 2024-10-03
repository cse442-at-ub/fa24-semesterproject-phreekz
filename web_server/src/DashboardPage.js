import React, { useState } from 'react';
import './DashboardPage.css'; // Ensure the CSS file is linked properly

const DashboardPage = () => {
    const [isFriendListCollapsed, setIsFriendListCollapsed] = useState(false);

    const toggleFriendList = () => {
        setIsFriendListCollapsed(!isFriendListCollapsed);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <button>🎵 Playlist 1</button>
                <button>🎵 Playlist 2</button>
                <button>🎵 Playlist 3</button>
                <div className="gear">
                    <i className="fas fa-cog"></i>
                </div>
            </div>

            {/* Main content area */}
            <div className="main-content">
                <h2>Charts</h2>

                {/* Charts section */}
                <div className="charts">
                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>This Week Wrapped</h3>
                        </div>
                        <p>Blah Blah 56%</p>
                        <p>Blah Blah 28%</p>
                        <p>Blah Blah 11%</p>
                        <p>Blah Blah 5%</p>
                    </div>

                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>Top Artists</h3>
                        </div>
                        <p>Blah Blah 56%</p>
                        <p>Blah Blah 28%</p>
                        <p>Blah Blah 11%</p>
                        <p>Blah Blah 5%</p>
                    </div>

                    <div className="chart-card">
                        <div className="chart-circle">
                            <h3>Top Songs</h3>
                        </div>
                        <p>Blah Blah 56%</p>
                        <p>Blah Blah 28%</p>
                        <p>Blah Blah 11%</p>
                        <p>Blah Blah 5%</p>
                    </div>
                </div>

                {/* Playlists section */}
                <h2>Your Playlists</h2>
                <div className="playlists">
                    <div className="playlist-card">
                        <img src="/public/images/playlist1.png" alt="Playlist 1" />
                    </div>
                    <div className="playlist-card">
                        <img src="/public/images/playlist2.png" alt="Playlist 2" />
                    </div>
                    <div className="playlist-card">
                        <img src="/public/images/playlist3.png" alt="Playlist 3" />
                    </div>
                </div>
            </div>

            {/* Friend Activity List */}
            <div className={`friend-list ${isFriendListCollapsed ? 'collapsed' : ''}`}>
                <button className="toggle-btn" onClick={toggleFriendList}>
                    {isFriendListCollapsed ? '→' : '←'}
                </button>
                <div className="friend">
                    <img src="/public/images/empty_profile.png" alt="" />
                    <p>MrDerpyPants - Album: Song</p>
                </div>
                <div className="friend">
                    <img src="/public/images/empty_profile.png" alt="" />
                    <p>Sadeed - Album: Song</p>
                </div>
                <div className="friend">
                    <img src="/public/images/empty_profile.png" alt="" />
                    <p>Spencer - Album: Song</p>
                </div>
                <div className="friend">
                    <img src="/public/images/empty_profile.png" alt="" />
                    <p>Gordon - Album: Song</p>
                </div>
                <div className="friend">
                    <img src="/public/images/empty_profile.png" alt="" />
                    <p>GLITCH GLITCH - Album: Song</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
