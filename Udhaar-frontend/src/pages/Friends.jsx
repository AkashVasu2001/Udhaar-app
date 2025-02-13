import { NavLink } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import AddFriendModal from "../components/AddFriendModal";
import { useState, useEffect } from "react";

const Friends = () => {
  const [error, setError] = useState(null);
  const { userId , openModal} = useModal();

  const [friendsData, setFriendsData] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/friends/balance`, {
      method: "GET",
      headers: {
        userid: userId,
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setFriendsData(data.data || []); // Safeguard against undefined data
      })
      .catch(() => {
       // alert(error.message);
        setError("Failed to load friends. Please try again later.");
      });
  }, []);

  const handleAddFriend = () => {
    openModal("Add Friend", <AddFriendModal />);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-3xl font-bold mb-3">Friends</h1>
      <div className="flex flex-col space-y-4 overflow-auto max-h-[500px] p-3 scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent">
        {error && <p className="text-red-500">{error}</p>}
        {friendsData.length === 0 && !error && <p>No friends found.</p>}
        {friendsData.map((friend) => (
          <div
            key={friend.friendId}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-300"
          >
            {/* Profile Picture and Name */}
            <div className="flex items-center space-x-4">
              <img
                src={friend.dp}
                alt={`${friend.name}'s profile`}
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
              <NavLink
                to={`/friends/${friend.friendId}`}
                className="text-lg font-semibold text-[#1d70a2] hover:underline"
              >
                {friend.name}
              </NavLink>
            </div>
            {/* Balance Status */}
            <div className="text-right">
              {friend.balance > 0 ? (
                <>
                  <p className="text-sm sm:text-base font-medium text-green-500">
                    Owes You
                  </p>
                  <p className="text-lg font-bold">₹ {friend.balance}</p>
                </>
              ) : friend.balance < 0 ? (
                <>
                  <p className="text-sm sm:text-base font-medium text-red-500">
                    You Owe
                  </p>
                  <p className="text-lg font-bold">
                    ₹ {Math.abs(friend.balance)}
                  </p>
                </>
              ) : (
                <p className="text-sm sm:text-base font-medium text-gray-500">
                  Settled
                </p>
              )}
            </div>
          </div>
        ))}
        {/* Action Buttons */}
      </div>
      <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
        <button
          onClick={handleAddFriend}
          className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
        >
          Add Friend
        </button>
      </div>
    </div>
  );
};

export default Friends;
