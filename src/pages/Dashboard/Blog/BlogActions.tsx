import { motion } from "framer-motion";

interface Props {
  loading: boolean;
  handleCancel: () => void;
  initial?: any;
}

export default function BlogActions({ loading, handleCancel, initial }: Props) {
  return (
    <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200">
      <motion.button
        whileHover={{ scale: 1.05 }}
        type="button"
        onClick={handleCancel}
        className="px-5 py-2 border rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition font-medium shadow-sm"
      >
        Cancel
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        type="submit"
        disabled={loading}
        className={`px-6 py-2 text-white rounded-lg font-semibold shadow-md transition 
          bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
          ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
      >
        {loading ? (initial ? "Updating..." : "Creating...") : initial ? "Update Blog" : "Create Blog"}
      </motion.button>
    </div>
  );
}
