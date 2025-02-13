import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext"; // Modal context
import { useParams } from "react-router-dom"; // For extracting groupId from URL
import axios from "axios";

const AddMemberModal = ({groupId}) => {
  const { isOpen, closeModal,userId } = useModal();
  const [members, setMembers] = useState([]); // List of group members
  const [friends, setFriends] = useState([]); // List of user's friends
  const [availableFriends, setAvailableFriends] = useState([]); // Friends not in the group
  const [selectedMemberId, setSelectedMemberId] = useState(""); // Member to add
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch group members and friends
  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setIsLoading(true);
        // Fetch group members
        const groupResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/group/${groupId}`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const groupData = groupResponse.data.data;
        setMembers(groupData.members); // Assuming response contains a 'members' array

        // Fetch friends
        const friendsResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/friends`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
            },
          }
        );
        const friendsData = friendsResponse.data.data;
        setFriends(friendsData);

        // Compute available friends (friends not already in the group)
        const memberIds = new Set(groupData.members.map((member) => member.memberId));
        const filteredFriends = friendsData.filter(
          (friend) => !memberIds.has(friend.friendId)
        );
        setAvailableFriends(filteredFriends);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        console.log(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/groups/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: userId,
        },
        body: JSON.stringify({
          userId2: selectedMemberId,
          groupId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
       console.log(data.message || "Something went wrong");
      }

      closeModal(); // Close modal after success
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p>Loading group members and friends...</p>
      ) : (
        <>
          <select
            className="mt-2 px-4 py-2 w-full border rounded-md"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
          >
            <option value="" disabled>Select a friend to add</option>
            {availableFriends.map((friend) => (
              <option key={friend.friendId} value={friend.friendId}>
                {friend.name} {/* Assuming 'name' is a field in the friend data */}
              </option>
            ))}
          </select>
        </>
      )}

      <br /><br />
      <button
        type="submit"
        className={`text-white bg-[#38726C] px-4 py-2 rounded-md hover:bg-[#254441] ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Member"}
      </button>
    </form>
  );
};

export default AddMemberModal;
