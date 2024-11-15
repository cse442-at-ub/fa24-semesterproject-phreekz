// PlaylistsPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate for the back button
import DOMPurify from 'dompurify';
import './PlaylistsPage.css';
import Cookies from 'js-cookie';

const PlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state
    const location = useLocation();
    const accessToken = Cookies.get('access_token'); // location.state?.accessToken; // Get accessToken from location state
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
        navigate('/dashboard', { state: { access_token: accessToken } } ); // Redirect back to the dashboard
    };

    return (
        <div className="playlists-container">
            <div className="playlists-sidebar">
                <button className="back-btn" onClick={handleBackClick}>⬅ Back</button>
            </div>

            <div className="playlists-content">

                {loading ? (
                    <p>Loading playlists...</p> // Display while fetching playlists
                ) : playlists.length > 0 ? (
                    <div className="playlist-grid">
                        {playlists.map((playlist) => (
                            <div key={playlist.id} className="playlist-card">
                                <img
                                    src={playlist.images[0]?.url || 'default-image-url'}
                                    alt={DOMPurify.sanitize(playlist.name)}
                                    className="playlist-image"
                                />
                                <div className="playlist-info">
                                    <h3
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(playlist.name),
                                        }}
                                    ></h3>
                                    <p
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(`${playlist.tracks.total} songs`),
                                        }}
                                    ></p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No playlists found.</p>
                )}
            </div>
        </div>
    );
};

export default PlaylistsPage;