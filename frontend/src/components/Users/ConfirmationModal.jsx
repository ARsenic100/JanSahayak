import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AiOutlineClose } from "react-icons/ai";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // The modal content we’ll portal to body
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all duration-300 ease-out scale-95 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
          aria-label="Close"
        >
          <AiOutlineClose size={20} />
        </button>

        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
        <p className="text-gray-600 mb-6 text-center">{message}</p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmationModal;
