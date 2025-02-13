import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext"; // Modal context
import axios from "axios"; // For API requests

const AddGroupModal = ({ onGroupAdded }) => {
  const { closeModal,userId } = useModal(); // Modal close function
  const [groupName, setGroupName] = useState(""); // State for group name
  const [groupDescription, setGroupDescription] = useState(""); // State for group description
  const [friendSearch, setFriendSearch] = useState(""); // State for friend search
  const [selectedFriends, setSelectedFriends] = useState([]); // State for selected friends
  const [friendsList, setFriendsList] = useState([]); // State for fetched friends
  const [submitting, setSubmitting] = useState(false); // State for form submission
  // Fetch friends list from backend
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/friends`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setFriendsList(response.data.data); // Populate friends list
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchFriends();
  }, []);

  // Handle adding a friend to the selected list
  const handleAddFriend = (friend) => {
    setSelectedFriends((prevSelectedFriends) => {
      if (!prevSelectedFriends.some((f) => f.friendId === friend.friendId)) {
        return [...prevSelectedFriends, friend]; // Add the friend to the list
      }
      return prevSelectedFriends; // Don't add the friend if already selected
    });
    setFriendSearch(""); // Clear search input after adding friend
  };

  // Handle removing a friend from the selected list
  const handleRemoveFriend = (friend) => {
    setSelectedFriends(
      selectedFriends.filter((f) => f.friendId !== friend.friendId)
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const userIds = selectedFriends.map((friend) => friend.friendId);
      const payload = {
        userIds,
        groupName,
        groupDescription,
      };
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/group/create`,

        payload,
        {
          headers: {
            userid: userId,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const newGroup = response.data;
      onGroupAdded(newGroup);
      setSubmitting(false);
      closeModal(); // Close modal after submitting
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Group Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Group Name</label>
          <input
            type="text"
            className="mt-2 px-4 py-2 w-full border rounded-md"
            placeholder="Enter group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* Group Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">
            Group Description
          </label>
          <input
            type="text"
            className="mt-2 px-4 py-2 w-full border rounded-md"
            placeholder="Enter group description"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />
        </div>

        {/* Add Friends */}
        <div className="mb-4 md:col-span-2">
          <label className="block text-gray-700 font-medium">Add Friends</label>
          <input
            type="text"
            className="mt-2 px-4 py-2 w-full border rounded-md"
            placeholder="Search for friends"
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
          />
          {/* Suggestions Dropdown */}
          <ul className="mt-2 bg-white border rounded-md shadow-md max-h-40 overflow-y-auto">
            {(friendSearch
              ? friendsList?.filter((friend) =>
                  friend.name.toLowerCase().includes(friendSearch.toLowerCase())
                )
              : friendsList
            )?.map((friend) => {
              return (
                <li
                  key={friend.friendId}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleAddFriend(friend)}
                >
                  {friend.name}
                </li>
              );
            })}
          </ul>

          {/* Selected Friends */}
          <div className="mt-4">
            {selectedFriends.map((friend) => (
              <span
                key={friend.friendId}
                className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-2"
              >
                {friend.name}
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFriend(friend)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="button"
          onClick={closeModal} // Close modal on cancel
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit" 
          //onClick={}
          className="px-4 py-2 bg-[#38726C] text-white rounded-md hover:bg-[#254441]"
        >
          Add Group
        </button>
      </div>
    </form>
  );
};

export default AddGroupModal;
