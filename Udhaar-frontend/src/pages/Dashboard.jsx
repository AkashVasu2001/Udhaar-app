import Summary from "../components/Summary";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import FriendList from "../components/FriendList";
import BalanceSection from "../components/BalanceSection";
import { useModal } from "../context/ModalContext";
import AddExpenseForm from "../components/AddExpenseForm";
import SettleUpForm from "../components/SettleUpForm";
// import Test from "../components/Test";
const Dashboard = () => {
  const { openModal,userId } = useModal();

  // Mock Data
  const [youOweData, setYouOweData] = useState([]);
  const [youAreOwedData, setYouAreOwedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/expenses`,
          {
            headers: {
              userid: userId,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        

        const data = await response.json();

        const { owe = { expenses: [] }, lent = { expenses: [] } } =
          data.data || {};

        const mappedOweData = owe.expenses.map((expense) => ({
          id: expense?._id || "Unknown ID",
          title: expense?.title || "No Title",
          createdAt: expense?.createdAt || null,
          groupId: expense?.groupId?._id || null,
          borrowerDetails: expense?.borrowerDetails || [],
          lenderId: expense?.lenderId || null,
          friendName: expense?.friendDetails?.name || "Unknown",
          amount: (expense?.borrowerDetails || []).reduce(
            (sum, b) => sum + (b?.amountLent || 0),
            0
          ),
          dp:expense?.friendId?.image || expense?.groupId?.dp ,
          groupName: expense?.groupId?.name || null,
        }));

        const mappedLentData = lent.expenses.map((expense) => ({
          id: expense?._id || "Unknown ID",
          title: expense?.title || "No Title",
          createdAt: expense?.createdAt || null,
          groupId: expense?.groupId?._id || null,
          borrowerDetails: expense?.borrowerDetails || [],
          lenderId: expense?.lenderId || null,
          friendName: expense?.friendDetails?.name || "Unknown",
          amount: (expense?.borrowerDetails || []).reduce(
            (sum, b) => sum + (b?.amountLent || 0),
            0
          ),
          dp:expense?.friendId?.image || expense?.groupId?.dp,
          groupName: expense?.groupId?.name || null,
        }));

        setYouOweData(mappedOweData);
        setYouAreOwedData(mappedLentData);
      } catch (err) {
        console.log(err.message);

        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    

    fetchExpenses();
  }, []);

  const handleAddExpense = () => {
    openModal(
      "Add Expense",
      <AddExpenseForm
        onSubmit={(reminderDetails) => {
          console.log("Expense:", reminderDetails);
          // Here, you can add logic to save reminders
        }}
      />
    );
  };

  const handleSettleUp = () => {
    openModal("Settle Up", <SettleUpForm youOweData={youOweData} />);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (<>
    {/* <Nav/> */}
    <div className="p-6 max-w-7xl mx-auto  ">
      {/* Dashboard Header */}
      <h1 className="text-3xl font-bold mb-3">Expense</h1>
      {/* <Test /> */}
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3">
        {/* Left Column (Summary & Friend List) */}
        <div className="col-span-1 lg:col-span-2 flex flex-col space-y-4">
          <Summary />
          <FriendList />
        </div>

        {/* You Owe Section */}
        <div className="col-span-1 lg:col-span-3 w-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <BalanceSection
              title="You Owe"
              expenses={youOweData}
              actionLabel="Settle Up"
              onActionClick={handleSettleUp}
            />
          </div>
        </div>

        {/* You Are Owed Section */}
        <div className="col-span-1 lg:col-span-3 w-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <BalanceSection
              title="You Are Owed"
              expenses={youAreOwedData}
              actionLabel="Add Expense"
              onActionClick={handleAddExpense}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
