import { motion } from "framer-motion";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmCloseModal({ onClose, onConfirm }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl p-6 w-[320px] text-center border border-gray-200"
      >
        <h4 className="text-lg font-semibold mb-3 text-gray-800">Unsaved Changes</h4>
        <p className="text-gray-600 mb-6 text-sm">
          Are you sure you want to close this form? Your unsaved edits will be lost.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Yes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
