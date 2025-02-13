import { useEffect } from "react";
import { useModal } from "../context/ModalContext";

const Modal = () => {
  const { isOpen, title, content, closeModal } = useModal();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  // const handleBackdropClick = (e) => {
  //   if (e.target === e.currentTarget) closeModal();
  // };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
      //onClick={handleBackdropClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          {title}
        </h2>
        <div id="modal-content" className="mb-4">
          {content}
        </div>
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-4xl px-4 py-2 rounded-md hover:text-red-600"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
