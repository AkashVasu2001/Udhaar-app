import { useParams } from "react-router-dom";
import SettleUpForm from "../components/SettleUpForm";
import ReminderForm from "../components/ReminderForm";
import { useModal } from "../context/ModalContext";
import { useState, useEffect } from "react";
import axios from "axios";

const FriendDetail = () => {
  const { openModal,userId } = useModal();
  const { friendId } = useParams();
  const [friendData, setFriendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSettleUp = () => {
    openModal("Settle Up", <SettleUpForm friendId={friendId} />);
  };

  const handleRemind = () => {
    openModal(
      "Set Reminder",
      <ReminderForm 
        onSubmit={(reminderDetails) => {
          console.log("Reminder Set:", reminderDetails);
        } }
      />
    );
  };

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        setLoading(true);
        
        // Fetch balance data
        const balanceResponse = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/friends/balance`, {
          headers: {
            userid: userId,
            "Content-Type": "application/json",
          },
        });

        const friendBalance = balanceResponse.data.data.find(
          (friend) => friend.friendId === friendId
        );
        if (!friendBalance) {
          throw new Error("Friend not found in balance data.");
        }

        // Fetch expenses for the friend
        const expensesResponse = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/api/expenses/friend`,
          { friendId },
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
            },
          }
        );
        setFriendData({
          ...friendBalance,
          expenses: expensesResponse.data.data,
        });
      } catch (err) {
        setError("Failed to fetch friend details.");
        console.log(err.message);

      } finally {
        setLoading(false);
      }
    };

    fetchFriendData();
  }, [friendId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {friendData ? (
        <>
          <h1 className="text-xl sm:text-3xl font-bold">{friendData.name}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
            <div className="flex items-center space-x-4">
              <img
                src={friendData.dp || "https://via.placeholder.com/100"}
                alt={friendData.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full"
              />
              <div>
                <p className="text-md sm:text-lg font-medium">
                  You owe: ₹
                  {friendData.balance < 0 ? Math.abs(friendData.balance) : "0"}
                </p>
                <p className="text-md sm:text-lg font-medium">
                  They owe you: ₹
                  {friendData.balance > 0 ? friendData.balance : "0"}
                </p>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-4">
              <button
                onClick={handleSettleUp}
                className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7] text-sm sm:text-base"
              >
                Settle Up
              </button>
              <button
                onClick={handleRemind}
                className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7] text-sm sm:text-base"
              >
                Remind
              </button>
            </div>
          </div>

          <div className="mt-6 ">
            <h2 className="text-lg sm:text-2xl font-semibold">
              Shared Expenses
            </h2>
            <div className="h-[400px] overflow-auto scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent">
              {friendData.expenses && friendData.expenses.length > 0 ? (
                friendData.expenses.map((expense, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 p-3 sm:p-4 rounded-lg shadow-sm mt-4 flex flex-row items-center justify-between"
                  >
                    <p className="text-lg sm:text-xl font-medium text-gray-700">
                      {expense.title}
                    </p>

                    <p className="text-lg sm:text-2xl  text-[#1d70a2]">{` ₹${expense.amount}`}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No expenses with this friend yet.
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default FriendDetail;
