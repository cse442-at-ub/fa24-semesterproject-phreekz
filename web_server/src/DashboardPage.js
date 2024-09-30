import React from 'react';
import './DashboardPage.css'; // Make sure to reference the new CSS file

const DashboardPage = () => {
    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <img src="/public/images/profile-picture.png" alt="Profile" />
                <button>🎵 Playlist 1</button>
                <button>🎵 Playlist 2</button>
                <button>🎵 Playlist 3</button>
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
        </div>
    );
};

export default DashboardPage;
