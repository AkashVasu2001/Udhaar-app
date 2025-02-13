import { useState, useEffect } from "react";
import { useModal } from "../context/ModalContext";
import axios from "axios";

const AddExpenseForm = ({ onSubmit }) => {
  const { closeModal,userId } = useModal();
  const [friendsList, setFriendsList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);

  // State for expense form data
  const [selectedGroupOrFriend, setSelectedGroupOrFriend] = useState();
  const [selectedGroupOrFriendName, setSelectedGroupOrFriendName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const [splitType, setSplitType] = useState("split");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [includedFriends, setIncludedFriends] = useState([{ _id: userId, name: "You" }]);
  const [excludedFriends, setExcludedFriends] = useState([]);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [splitDetails, setSplitDetails] = useState({});

  // Fetch friends and groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsResponse, groupsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_URL}/api/friends/balance`, {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }),
          axios.get(`${import.meta.env.VITE_SERVER_URL}/api/groups`, {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }),
        ]);

        setFriendsList(friendsResponse.data.data || []);
        setGroupsList(groupsResponse.data || []);
      } catch (error) {
       console.log(error.message);
      }
    };

    fetchData();
    
  }, []);

  const resetCalculations = () => {
    setSplitDetails({});
  };

  const handleSelect = (input) => {
    // Check if input is a group (_id)
    const group = groupsList.find((g) => g._id === input._id);
    if (group) {
      setIncludedFriends(group.members); // Set group members
      setExcludedFriends([]);
      setSelectedGroupOrFriend(input);
      setSelectedGroupOrFriendName(input.name);
    }
    // Check if input is a friend (friendId)
    else if (friendsList.some((friend) => friend.friendId === input.friendId)) {
      setIncludedFriends((prev)=> [...prev, {_id:input.friendId, name:input.name}]); // Add friend to included friends
      setExcludedFriends([]);
      setSelectedGroupOrFriend(input);
      setSelectedGroupOrFriendName(input.name);
    }


    setIsSuggestionVisible(false); 
  };

  const handleSplitDetailChange = (friendId, field, value) => {
    
    setSplitDetails((prev) => ({
      ...prev,
      [friendId]: {
        ...prev[friendId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {

    //e.preventDefault();
    //const userId = import.meta.env.VITE_TEST_USER;
    const expenseDetails = {
      lenderId: userId,
      borrowerDetails: includedFriends.map((friend) => ({
        borrowerId: friend._id,
        amountLent:
  splitMethod === "equal"
    ? amount / includedFriends.length
    : splitMethod === "percentage"
    ? (splitDetails[friend._id]?.percentage / 100) * amount || 0
    : splitDetails[friend._id]?.amount || 0,
      })),
      groupId: groupsList.some((group) => group._id === selectedGroupOrFriend._id)
        ? selectedGroupOrFriend._id
        : null,
      
      friendId: friendsList.some((friend)=> friend.friendId == selectedGroupOrFriend.friendId)
        ? selectedGroupOrFriend.friendId
        : null,
      amount: amount,
      title: description,
    };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/expense/add`,
        expenseDetails,
        {
          headers: {
            userid: userId,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 201) {
        alert("Expense created successfully");
        onSubmit(response.data);
        closeModal();
      } else {
        alert("Failed to create expense");
      }
    } catch (error) {
      console.error(
        "Error creating expense:",
        error.response || error.message,
        import.meta.env.VITE_SERVER_URL,
        userId
      );

      //alert("Error creating expense");
    }
  };

  return (
    <>
      {/* Input for description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Dinner at Cafe"
          required
        />
      </div>

      {/* Input for amount */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="amount">
          Amount (₹)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          placeholder="0"
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
          className="w-full border p-2 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          re
        />
      </div>

      {/* Input for date */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border p-2 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Group or friend selector */}
      <div className="mb-4 relative">
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="groupOrFriend"
        >
          Group or Friend
        </label>
        <input
          id="groupOrFriend"
          type="text"
          value={selectedGroupOrFriendName}
          onChange={(e) => {
            setSelectedGroupOrFriendName(e.target.value);
            setIsSuggestionVisible(true);
          }}
          className="w-full border p-2 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Type to search..."
        />
        {isSuggestionVisible && (
          <div className="absolute bg-white border shadow-lg rounded-md p-4 z-50 mt-2 w-full">
            <ul className="max-h-60 overflow-y-auto">
              {/* Filter through friends and groups */}
              {[...friendsList, ...groupsList]
                .filter((item) =>
                  item.name
                    .toLowerCase()
                    .includes(selectedGroupOrFriendName.toLowerCase())
                )
                .map((item) => (
                  <li
                    key={item.friendId || item._id} // Use friendId for friends, _id for groups
                    onClick={() => {
                      handleSelect(item); // Correctly pass friendId or _id
                      setIsSuggestionVisible(false); // Hide suggestions after selection
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer "
                  >
                    {item.name}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
      {/* Split method */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="splitMethod">
          Split Method
        </label>
        <select
          id="splitMethod"
          value={splitMethod}
          onChange={(e) => {
            setSplitMethod(e.target.value);
            resetCalculations();
          }}
          className="w-full border p-2 rounded-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="equal">Equal</option>
          <option value="percentage">By Percentage</option>
          <option value="amount">By Amount</option>
        </select>
      </div>

      {/* Split details */}
      {splitMethod !== "equal" && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Split Details</h3>
          {includedFriends.map((friend) => {
            return (
              <div key={friend._id} className="flex items-center mb-2">
                <label className="w-1/3 text-sm">
                  {friend.name}{" "}
                </label>
                <input
                  type="number"
                  placeholder={
                    splitMethod === "percentage" ? "Percentage" : "Amount"
                  }
                  value={
                    splitDetails[friend._id]?.[
                      splitMethod === "percentage" ? "percentage" : "amount"
                    ] || ""
                  }
                  onChange={(e) => {
                    handleSplitDetailChange(
                      friend._id, 
                      splitMethod === "percentage" ? "percentage" : "amount",
                      parseFloat(e.target.value) || 0
                    );
                  }}
                  className="w-2/3 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Submit and cancel buttons */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => closeModal()}
          className="px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={
            () => handleSubmit()
            // {
            // description,
            // amount,
            // date,
            // splitMethod,
            // splitDetails,
            // selectedGroupOrFriend,
            // }
          }
          className="px-4 py-2 rounded-md  bg-[#1d70a2] text-white  text-sm hover:bg-[#2892d7]"
        >
          Add Expense
        </button>
      </div>
    </>
  );
};

export default AddExpenseForm;
