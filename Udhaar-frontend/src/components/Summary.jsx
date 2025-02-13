import { useEffect, useState } from "react";
import axios from "axios";
import { useModal } from "../context/ModalContext"; // Modal context

const Summary = () => {
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalOwed, setTotalOwed] = useState(0);
    const [totalOwing, setTotalOwing] = useState(0);
    const { userId } = useModal();

    // Helper function to format numbers
    const formatNumber = (num) => {
        return num.toFixed(2); // Keeps 2 decimal places
    };

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_SERVER_URL}/api/expenses`,
                    {
                        headers: {
                            userid: userId, // Ensure this is passed correctly
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "true",
                        },
                    }
                );

                const data = response.data.data;
                console.log("summary",data);
                // Extract values
                const totalOwed = data.owe.totalOwed || 0;
                const totalOwing = data.lent.totalLent || 0;
                //alert(totalOwed, totalOwing,data);
                // Calculate total balance
                const totalBalance = totalOwing - totalOwed;

                // Update state with formatted numbers
                setTotalBalance(formatNumber(totalBalance));
                setTotalOwed(formatNumber(totalOwed));
                setTotalOwing(formatNumber(totalOwing));
            } catch (error) {
                alert(error.message);
            }
        };

        fetchSummary();
    }, []);

    return (
        <div className="bg-[#1d70a2] p-4 sm:p-6 rounded-lg shadow-md text-white ">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
                Overview
            </h2>
            <div className="mb-2">
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                    Total Balance:
                </p>
                <p className="text-base sm:text-lg md:text-4xl">{`₹ ${totalBalance}`}</p>
            </div>
            <div className="mb-2">
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                    You Owe:
                </p>
                <p className="text-base sm:text-lg md:text-3xl">{`₹ ${totalOwed}`}</p>
            </div>
            <div>
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                    You Are Owed:
                </p>
                <p className="text-base sm:text-lg md:text-3xl">{`₹ ${totalOwing}`}</p>
            </div>
        </div>
    );
};

export default Summary;
