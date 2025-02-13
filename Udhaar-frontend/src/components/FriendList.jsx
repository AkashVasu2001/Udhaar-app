import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext"; // Modal context

const FriendList = () => {
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const { userId } = useModal();

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
        setFriends(data.data || []); // Safeguard against undefined data
      })
      .catch((error) => {
        console.log(error.message);
        setError("Failed to load friends. Please try again later.");
      });
  }, []);

  return (
    <div className=" min-h-[250px]  text-black ">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">Friends</h2>
      {error && <p className="text-red-500">{error}</p>}
      {friends.length === 0 && !error && <p>No friends found.</p>}
      <ul className="space-y-2 overflow-auto scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent p-1 max-h-[200px]">
        {friends.map((friend) => (
          <NavLink
            to={`/friends/${friend.friendId}`} // Navigate to the friend's detailed page
            key={friend.friendId}
            className="block"
          >
            <li className="flex justify-between  h-14 items-center bg-white rounded-md p-2 sm:p-2 shadow-sm hover:bg-gray-100 transition">
              {/* Profile Picture */}
              <img
                src={friend.dp}
                alt={`${friend.name}'s profile`}
                className="w-10 h-10 rounded-full object-cover border border-gray-300 mr-4"
              />
              {/* Name and Balance */}
              <div className="flex-1">
                <span className="text-sm sm:text-base md:text-base font-semibold block text-[#1d70a2]">
                  {friend.name}
                </span>
                <span
                  className={`text-sm md:text-sm font-medium ${
                    friend.balance > 0
                      ? "text-green-600"
                      : friend.balance < 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {friend.balance > 0
                    ? `Owes You ₹ ${friend.balance}`
                    : friend.balance < 0
                    ? `You Owe ₹ ${Math.abs(friend.balance)}`
                    : "Settled"}
                </span>
              </div>
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default FriendList;
