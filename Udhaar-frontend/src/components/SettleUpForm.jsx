import { useState, useEffect } from "react";
import axios from "axios";
import { useModal } from "../context/ModalContext";

const SettleUpForm = ({ groupId , friendId}) => {
  const { closeModal,userId } = useModal();
  const [friendsList, setFriendsList] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [offlineAmount, setOfflineAmount] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const currentPath = window.location.pathname;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentPath.startsWith("/friends/")) {
          //console.log("FriendIdkkk:", friendId);
          //const friendId_ = currentPath.replace("/friends/", "");
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/friends/balance`,
            {
              headers: {
                userid: userId,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );
          const friendData = response.data.data.find(
            (friend) => friend.friendId === friendId
          );
          
         // console.log("Friends Data:", friendData.friendId.name);
          setFriendsList([friendData]);
          setSelectedOption(friendData);
          // Automatically select this friend
        } else if (currentPath.startsWith("/Groups/")) {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/group/${groupId}`,
            {
              headers: {
                userid: userId,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );
          setFriendsList(response.data.data.members || []);
        } else {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_URL}/api/friends/balance`,
            {
              headers: {
                userid: userId,
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );
          setFriendsList(response.data.data || []);
        }
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchData();
  }, [currentPath]);

  // Filter friends based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filteredFriends = friendsList.filter(
        (friend) =>
          friend.name && // Ensure name exists
          friend.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filteredFriends);
    } else {
      // Show all friends by default if no search query
      setFilteredOptions(friendsList);
    }
  }, [searchQuery, friendsList]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle selection of a friend
  const handleOptionSelect = (friend) => {
    console.log(friend);
    setSelectedOption(friend);
    // setSearchQuery(friend.name);
    setFilteredOptions([]);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  // Handle offline payment amount change
  const handleOfflineAmountChange = (e) => {
    setOfflineAmount(e.target.value);
  };

  // Handle file change for proof
  const handleFileChange = (e) => {
    setProofImage(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedOption) {
      alert("Please select a friend or group member to settle up with.");
      return;
    }
  
    try {
      const requestData = {
        friendId: friendId || (groupId ? null : selectedOption.friendId),
        groupId: groupId || null,
        userId2: groupId ? selectedOption.friendId : null, // Required for group settlements
      };
  
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/settleup`,
        requestData,
        {
          headers: {
            userid: userId,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
  
      if (response.status === 200) {
        alert("Expense settled successfully!");
        closeModal();
      } else {
        alert(response.data.message || "Failed to settle up.");
      }
    } catch (error) {
      console.log(error.response?.data?.message || "An error occurred. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 min-h-[250px]">
      <div className="relative">
        <label className="block text-gray-700 font-medium mb-1">
          Select Friend
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search friend"
          className="border rounded-md p-2 w-full"
        />
        {filteredOptions.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded-md w-full mt-1 max-h-40 overflow-y-auto">
            {filteredOptions.map((friend) => (
              <li
                key={friend.friendid}
                onClick={() => handleOptionSelect(friend)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {friend.name || friend.friendId?.name} - ₹{friend.balance || friend.amount || friend.lentAmount|| 0}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedOption && (
        <div>
          <p className="text-gray-700">
            You owe <strong>₹{selectedOption.balance || selectedOption.amount || selectedOption.lentAmount|| 0}</strong> to{" "}
            <strong>{selectedOption.name ||selectedOption.friendId?.name}</strong>.
          </p>
        </div>
      )}

      {/* {selectedOption && (
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Payment Method
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === "online"}
                onChange={handlePaymentMethodChange}
              />
              <span>Pay Online</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="paymentMethod"
                value="offline"
                checked={paymentMethod === "offline"}
                onChange={handlePaymentMethodChange}
              />
              <span>Pay Offline</span>
            </label>
          </div>
        </div>
      )} */}

      {paymentMethod === "offline" && selectedOption && (
        <div>
          {/* <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              value={offlineAmount}
              onChange={handleOfflineAmountChange}
              placeholder="Enter amount"
              className="border rounded-md p-2 w-full"
            />
          </div> */}
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-1">
              Payment Proof
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="border rounded-md p-2 w-full"
            />
          </div>
        </div>
      )}

      {selectedOption && (
        <button
          type="submit"
          onClick={handleSubmit}
          className="text-white bg-[#38726C] px-4 py-2 rounded-md hover:bg-[#2c5c52] mt-4"
        >
          {paymentMethod === "online" ? "Pay Online" : "Complete Payment"}
        </button>
      )}
    </form>
  );
};

export default SettleUpForm;
