/* eslint-disable react/prop-types */
import { createContext, useContext, useState,useEffect } from "react";

// Create the context
const ModalContext = createContext();

// Modal Context Provider Component
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    content: null,
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    if (data) {
      try {
        const { _id } = JSON.parse(data);
        setUserId(_id);
      } catch (error) {
        console.error("Error parsing user-info:", error);
      }
    }
  }, []);
  
  const openModal = (title, content) => {
    setModalState({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: "", content: null });
  };

  return (
    <ModalContext.Provider
      value={{ ...modalState, openModal, closeModal, userId }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// Custom Hook for easy access to modal context
// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => useContext(ModalContext);
