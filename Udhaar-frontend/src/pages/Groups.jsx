import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import AddGroupModal from "../components/AddGroupModal";
import { images } from "../assets/images/assets.js";
const Groups = () => {
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { openModal ,userId} = useModal();

  const handleAddGroup = () => {
    console.log("Add Group button clicked");
    openModal(
      "Add Group",
      <AddGroupModal
        onGroupAdded={(newGroup) => {
          setGroupsData((prevGroups) => [...prevGroups, newGroup]);
        }}
      />
    ); // Open Add Group Modal
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/groups`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true", // Replace with actual user ID
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();

        setGroupsData(data);
      } catch (error) {
       // alert(error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-xl sm:text-3xl font-bold mb-3">Groups</h1>
      <div className="flex flex-col space-y-4 overflow-auto max-h-[500px] p-3 scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent">
        {groupsData.map((group, index) => (
          <div
            key={group._id || index}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-300"
          >
            {/* Left Section: Group Details */}
            <div className="flex items-center space-x-4">
              <img
                src={images[group.dp]}
                alt={`${group.name} DP`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                {/* Group Name */}
                <NavLink
                  to={`/Groups/${group._id}`}
                  className="text-lg font-semibold text-[#1d70a2] hover:underline"
                >
                  {group.name}
                </NavLink>

                {/* Created Date */}
                <p className="text-sm text-gray-500">
                  {`${new Date(group.createdAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>

            {/* Right Section: Financial Info */}
            <div className="text-right">
              <p
                className={`text-sm sm:text-base font-medium ${
                  group.status === "You owe" ? "text-red-500" : "text-green-500"
                }`}
              >
                {group.status}
              </p>
              <p className="text-lg font-bold">{group.amount}</p>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
      </div>
      <div className="flex justify-end space-x-2 sm:space-x-4 mt-4">
        {" "}
        <button
          onClick={handleAddGroup}
          className="self-end text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
        >
          Add Group
        </button>
      </div>
    </div>
  );
};

export default Groups;
