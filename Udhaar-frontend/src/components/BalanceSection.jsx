/* eslint-disable react/prop-types */
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { images } from "../assets/images/assets.js";

const BalanceSection = ({
  title,
  expenses = [],
  actionLabel,
  onActionClick,
}) => {
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedExpenseId((prev) => (prev === id ? null : id));
  };
  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

  return (
    <div className="bg-white p-3 rounded-lg shadow-md text-black h-full flex flex-col">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">{title}</h2>

      {/* Expenses List */}
      <ul className="flex-grow p-3 overflow-y-auto max-h-[300px] sm:max-h-[350px] md:max-h-[400px] max-w-md divide-y divide-gray-200 dark:divide-gray-700 scrollbar-thin scrollbar-thumb-[#1d70a2] scrollbar-track-transparent">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <li
              key={expense.id}
              className="py-3 sm:py-4 cursor-pointer"
              onClick={() => toggleExpand(expense.id)}
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* Friend's Avatar */}
                <div className="flex-shrink-0">
                  <img
                    className="w-8 h-8 rounded-full"
                    src={isNumeric(expense.dp)?images[expense.dp]:expense.dp}
                    alt={`${expense.title} avatar`}
                  />
                </div>
                {/* Expense Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-gray-900 truncate dark:text-white">
                    {expense.title}
                  </p>
                  {expense.groupName && (
                    <NavLink
                      to={`/Groups/${expense.groupId}`}
                      className="text-base text-[#38726C] font-medium"
                    >
                      {`# ${expense.groupName}`}
                    </NavLink>
                  )}
                </div>
                {/* Expense Amount */}
                <div className="inline-flex items-center text-lg sm:text-xl  font-semibold text-gray-900 dark:text-white">
                  ₹ {expense.amount}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedExpenseId === expense.id && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md shadow-inner">
                  <p className="text-sm text-gray-700">
                    <strong>Lender:</strong> {expense.lenderId.name}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Created At:</strong>{" "}
                    {new Date(expense.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Borrower Details:</strong>
                  </p>
                  <ul className="ml-4 ">
                    {expense.borrowerDetails.map((borrower) => (
                      <li key={borrower._id} className="text-sm">
                        <NavLink
                          to={`/friends/${borrower.borrowerId._id}`}
                          className="text-blue-500 hover:underline"
                        >
                          {borrower.borrowerId.name}
                        </NavLink>{" "}
                        - ₹{borrower.amountLent}{" "}
                        {borrower.paid ? "(Paid)" : "(Unpaid)"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))
        ) : (
          <p className="text-sm text-center text-gray-300">
            No expenses found.
          </p>
        )}
      </ul>

      {/* Action Button */}
      <div className="mt-auto text-right">
        <button
          className="text-white bg-[#1d70a2] px-4 py-2 rounded-md hover:bg-[#2892d7]"
          onClick={onActionClick}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default BalanceSection;
