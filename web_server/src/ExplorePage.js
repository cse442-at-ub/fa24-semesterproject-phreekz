import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExplorePage.css';
import Cookies from 'js-cookie';

const USER = process.env.REACT_APP_USER;

const ExplorePage = () => {
    const [friendsPlaylists, setFriendsPlaylists] = useState([]);
    // const [friendsIDs, setFriendsIDs] = useState([]);
    const location = useLocation();
    const accessToken = location.state?.accessToken;
    const navigate = useNavigate();

    const goBackToDashboard = () => {
        navigate('/dashboard', { state: { accessToken } });
    };

    const fetchPlaylists = async (friendsIDs) => {
        // Step 2: Fetch Playlists for each friend from Spotify API
        try {
            const playlistsData = await Promise.all(
                friendsIDs.map(async (friendId) => {
                    const playlistsResponse = await fetch(`https://api.spotify.com/v1/users/${friendId}/playlists`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    if (!playlistsResponse.ok) {
                        throw new Error(`Failed to fetch playlists for user ${friendId}`);
                    }

                    const playlists = await playlistsResponse.json();
                    return { friendId, playlists: playlists.items };
                })
            );

            setFriendsPlaylists(playlistsData);
        } catch (error) {
            console.error("Error fetching friends' spotify playlists:", error);
        }
    };

    // Fetch Friends' IDs and their Playlists
    useEffect(() => {

        const fetchFriends = async () => {
            if (!accessToken) {
                console.error("No access token found");
                return;
            }

            try { 
                const friendsUsernames = JSON.parse(Cookies.get('accepted_friends')).map(friend => friend.following);

                // Step 1: Fetch friends Spotify IDs from backend
                fetch(`/CSE442/2024-Fall/${USER}/api/getFriendsUserIDs.php`, {            
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        friends: friendsUsernames,
                    }), // double check this
                })
                .then(response => response.json())
                .then(data => {
                    // setFriendsIDs(data.userIDs);
                    fetchPlaylists(data.display_name_exists);
                })
                .catch(error => console.error(error));
            } catch (error) {
                console.error("Error fetching friends' spotify IDs:", error);
            }
        };

        fetchFriends();
    }, [accessToken]);

    return (
        <div className="explore-container">
            {/* Sidebar */}
            <div className="explore-sidebar">
                <button className="explore-back-button" onClick={goBackToDashboard}>⬅ Back</button>
            </div>
            {/* Main Content */}
            <div className="explore-content">
                <h2 className="explore-page-title">Friends' Playlists</h2>
                {friendsPlaylists.length > 0 ? (
                    <h3 className="explore-page-subtitle">{friendsPlaylists[0].friendId}'s Playlists</h3>
                    )
                    :
                    (
                    <p className="explore-no-friends">No friends' playlists found.</p>
                    )
                }
                {friendsPlaylists.length > 0 ? (
                    friendsPlaylists.map((friend) => (
                        <div key={friend.friendId} className="explore-friend-playlists">
                            <div className="explore-playlists-grid">
                                {friend.playlists.map((playlist) => (
                                    <div key={playlist.id} className="explore-playlist-card">
                                        <img className="explore-playlist-image" src={playlist.images[0]?.url} alt={playlist.name}  />
                                        <p className="explore-playlist-name" >{playlist.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="explore-no-friends">No friends' playlists found.</p>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;