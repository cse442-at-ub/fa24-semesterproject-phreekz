import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExplorePage.css';
import Cookies from 'js-cookie';

const ExplorePage = () => {
    const [friendsPlaylists, setFriendsPlaylists] = useState([]);
    const [friendsIDs, setFriendsIDs] = useState([]);
    const location = useLocation();
    const accessToken = location.state?.accessToken;
    const navigate = useNavigate();

    const goBackToDashboard = () => {
        navigate('/dashboard', { state: { accessToken } });
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
                fetch('/CSE442/2024-Fall/cegaliat/api/getFriendsUserIDs.php', {            
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        friends: friendsUsernames,
                    }), // double check this
                }).then(response => response.json())
                .then(data => {
                    setFriendsIDs(data.userIDs);
                })
                .catch(error => console.error(error));

                // Step 2: Fetch Playlists for each friend from Spotify API
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
                console.error("Error fetching friends' playlists:", error);
            }
        };

        fetchFriends();
    }, [accessToken]);

    return (
        <div className="explore-container">
            {/* Sidebar */}
            <div className="explore-sidebar">
                <button className="back-button" onClick={goBackToDashboard}>⬅ Back</button>
            </div>
            {/* Main Content */}
            <div className="explore-content">
                <h2>Friends' Playlists</h2>
                {friendsPlaylists.length > 0 ? (
                    friendsPlaylists.map((friend) => (
                        <div key={friend.friendId} className="friend-playlists">
                            <h3>{friend.friendId}'s Playlists</h3> {/* Use friendId here */}
                            <ul>
                                {friend.playlists.map((playlist) => (
                                    <li key={playlist.id}>{playlist.name}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>No friends' playlists found.</p>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
