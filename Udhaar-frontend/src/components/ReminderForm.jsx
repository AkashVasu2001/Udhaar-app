/* eslint-disable react/prop-types */
import { useState } from "react";
import { useModal } from "../context/ModalContext";

const ReminderForm = ({ onSubmit }) => {
  const { closeModal } = useModal();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    repeat: "none",
    emailContent: `Hi [Recipient's Name],

Just a friendly reminder about the upcoming event. Here are the details:
- Date: [Insert Date]
- Time: [Insert Time]
- Notes: [Optional Details]

Let me know if you need any further information.

Best regards,
[Your Name]`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form data if needed before proceeding
    onSubmit({ ...formData }); // Pass all form data
    closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Select Date
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Select Time
        </label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">Repeat</label>
        <select
          name="repeat"
          value={formData.repeat}
          onChange={handleChange}
          className="border rounded-md p-2 w-full"
        >
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Reminder Email Content
        </label>
        <textarea
          name="emailContent"
          value={formData.emailContent}
          onChange={handleChange}
          className="border rounded-md p-2 w-full h-40"
        ></textarea>
      </div>
      <button
        type="submit"
        className="text-white bg-[#38726C] px-4 py-2 rounded-md hover:bg-[#2c5c52]"
      >
        Set Reminder
      </button>
    </form>
  );
};

export default ReminderForm;
