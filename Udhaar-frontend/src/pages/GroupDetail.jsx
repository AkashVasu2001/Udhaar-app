import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import AddExpenseForm from "../components/AddExpenseForm";
import SettleUpForm from "../components/SettleUpForm";
import axios from "axios";
import AddMemberModal from "../components/AddMemberModal";
import { images } from "../assets/images/assets.js";

const GroupProfilePicture = ({ groupName, groupDp }) => {
  console.log(groupDp);
  return (
    <div className="flex items-center space-x-3">
      <img
        className="w-12 h-12 rounded-full bg-gray-300 "
        src={images[groupDp]}
        alt={groupName}
      />
      <span className="text-4xl font-bold text-[#1d70a2]">{groupName}</span>
    </div>
  );
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { openModal, userId } = useModal();
  const [groupData, setGroupData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBalance, setGroupBalance] = useState(0);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setIsLoading(true);
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
        const members = response.data.data.members;
        setGroupBalance(
          members.reduce((acc, member) => {
            return acc + (member.lentAmount || 0); // Add lentAmount if it exists; otherwise, add 0
          }, 0)
        );
        console.log(response.data)
        setGroupData(response.data.data); // Assuming data contains the group and members
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load group details");
        //alert(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_URL}/api/expenses/group/${groupId}`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        setExpenses(response.data.data || []);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchGroupDetails();
    fetchExpenses();
  }, [groupId]);

  const handleAddExpense = () => {
    openModal("Add Expense", <AddExpenseForm />);
  };

  const handleSettleUp = () => {
    openModal("Settle Up", <SettleUpForm groupId={groupId} />);
  };

  const handleAddMember = () => {
    openModal("Add Member", <AddMemberModal groupId={groupId} />);
  };
  if (isLoading) {
    return <div className="p-6 text-center">Loading group details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">{error}</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-[#38726C] text-white px-6 py-2 rounded-md hover:bg-[#2c5c52]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 p-6 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <GroupProfilePicture
        groupName={groupData?.name || "Unnamed Group"}
        groupDp={groupData?.dp}
      />
      <p className="text-xl text-gray-700 mt-2 italic">
        {groupData?.description || "No description provided"}
      </p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">
            Group Details
          </h2>
          <div className="mt-2 p-4 border rounded-lg">
            <p className="text-xl font-medium">
              Total Balance:{" "}
              <span className="text-[#1d70a2] font-bold">
                {groupBalance || "₹0"}
              </span>
            </p>
            <h3 className="text-xl mt-4 font-medium">Members:</h3>
            <ul className="list-disc list-inside mt-2">
              {groupData.members?.length > 0 ? (
                groupData.members.map((member) => (
                  <li key={member.memberId} className="text-lg">
                    <span className="font-semibold">
                      <NavLink
                        to={`/friends/${member.memberId}`}
                        className="text-[#1d70a2] hover:underline"
                      >
                        {member.name}
                      </NavLink>
                    </span>
                    :{" "}
                    <span>
                      {member.lentAmount !== undefined
                        ? `₹${member.lentAmount}`
                        : "No transactions yet"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-lg text-gray-500">No members available</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800">Expenses</h2>
          <ul className="mt-2 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent">
            {expenses?.length > 0 ? (
              expenses.map((expense, index) => (
                <li key={index} className="text-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-xl text-[#1d70a2]">
                      {expense.title}
                    </p>
                    <p className="font-semibold">
                      <p>{expense.lenderId?.name || "Unknown"}</p>
                      <p className="text-[#1d70a2] items-end">
                        ₹{expense.amount}
                      </p>
                    </p>
                  </div>

                  <p className="text-gray-600">
                    {(expense.borrowerDetails || []).map((borrower) => (
                      <li key={borrower._id}>
                        <span className="font-semibold">
                          {borrower.borrowerId?.name}
                        </span>
                        ₹{borrower.amountLent}
                      </li>
                    ))}
                  </p>
                  <hr />
                  <br />
                </li>
              ))
            ) : (
              <li className="text-lg text-gray-500">No expenses available</li>
            )}
          </ul>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={handleAddExpense}
          className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
        >
          Add Expense
        </button>
        <button
          onClick={handleSettleUp}
          className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
        >
          Settle Up
        </button>
        <button
          onClick={handleAddMember}
          className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
        >
          Add Member
        </button>
      </div>
    </div>
  );
};

export default GroupDetail;
