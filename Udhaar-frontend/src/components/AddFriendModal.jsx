import { useState } from "react";
import { useModal } from "../context/ModalContext"; // Modal context

const AddFriendModal = () => {
  const { isOpen, closeModal,userId } = useModal();
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      // Replace this URL with your actual server endpoint
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/friends/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid:userId, // Replace with the logged-in user's ID
        },
        body: JSON.stringify({ email: friendEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
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
    <form onSubmit={handleSubmit} className="p-4 bg-white ">
      {/* <h2 className="text-lg font-bold mb-4">Add a Friend</h2> */}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <label className="block text-gray-700">Friend&apos;s Email</label>
      <input
        type="email"
        className="mt-2 px-4 py-2 w-full border rounded-md"
        placeholder="Enter friend's email"
        value={friendEmail}
        onChange={(e) => setFriendEmail(e.target.value)}
        required
      />

      <br />
      <button
        type="submit"
        className={`text-white bg-[#38726C] px-4 py-2 rounded-md hover:bg-[#254441] ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Friend"}
      </button>
    </form>
  );
};

export default AddFriendModal;
