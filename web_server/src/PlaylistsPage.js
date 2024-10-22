// PlaylistsPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate for the back button
import './PlaylistsPage.css';

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state
    const location = useLocation();
    const accessToken = location.state?.accessToken; // Get accessToken from location state
    const navigate = useNavigate(); // For the back button

    // Fetch playlists and render them
    useEffect(() => {
        if (accessToken) {
            fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((response) => response.json())
            .then((data) => {
                setPlaylists(data.items);
                setLoading(false); // Stop loading once playlists are fetched
            })
            .catch((error) => {
                console.error('Error fetching playlists:', error);
                setLoading(false); // Stop loading in case of an error
            });
        }
    }, [accessToken]);

    const handleBackClick = () => {
        navigate('/dashboard'); // Redirect back to the dashboard
    };

    return (
        <div className="playlists-page">
            <div className="sidebar">
                <button className="back-btn" onClick={handleBackClick}>⬅ Back</button>
            </div>

            <div className="main-content">
                <h1>Your Playlists</h1>

                {loading ? (
                    <p>Loading playlists...</p> // Display while fetching playlists
                ) : playlists.length > 0 ? (
                    <div className="playlist-grid">
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="playlist-card">
                                <img
                                    src={playlist.images[0]?.url || 'default-image-url'} 
                                    alt={playlist.name} 
                                    className="playlist-image"
                                />
                                <div className="playlist-info">
                                    <h3>{playlist.name}</h3>
                                    <p>{playlist.tracks.total} songs</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No playlists found or failed to fetch.</p>
                )}
            </div>
        </div>
    );
};

export default PlaylistsPage;
