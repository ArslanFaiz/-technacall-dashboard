import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, MessageSquare, PlusCircle, ChevronLeft, ChevronRight, Calendar, Trash2 } from "lucide-react";
import api from "../../../api/api";
import toast from "react-hot-toast";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

const perPage = 10;

export default function ContactPage() {
  const [list, setList] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false); // For Add/Update
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For Delete
  const [newContactData, setNewContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.get("/api/contacts", {
          params: { page, limit: perPage },
        });
        if (res.data.success) {
          setList(res.data.data.contacts);
        } else {
          console.error("Error fetching contacts:", res.data.message);
        }
      } catch (err) {
        console.error("API error:", err);
      }
    };
    fetchContacts();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(list.length / perPage));
  const pageItems = list.slice((page - 1) * perPage, page * perPage);

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingId(contact.id);
      setNewContactData({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
      });
    } else {
      setEditingId(null);
      setNewContactData({ name: "", email: "", subject: "", message: "" });
    }
    setIsModalOpen(true);
  };

  const handleAddContact = async () => {
    if (!newContactData.name || !newContactData.email || !newContactData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/api/contacts/${editingId}`, newContactData);
        if (res.data.success) {
          setList((prev) =>
            prev.map((c) =>
              c.id === editingId
                ? { ...c, ...newContactData, updatedAt: new Date().toISOString() }
                : c
            )
          );
          setHighlightedId(editingId);
          setTimeout(() => setHighlightedId(null), 1500);
        }
      } else {
        const newItem: Contact = {
          ...newContactData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        setList((p) => [newItem, ...p]);
        setHighlightedId(newItem.id);
        setTimeout(() => setHighlightedId(null), 1500);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving contact:", err);
      toast.error("Failed to save contact");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    setIsDeletingId(id);
    try {
      const res = await api.delete(`/api/contacts/${id}`);
      if (res.data.success) {
        setList((prev) => prev.filter((c) => c.id !== id));
        setShowDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Error deleting contact:", err);
      toast.error("Failed to delete contact");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Contact Messages
        </h1>

        <motion.button
          onClick={() => handleOpenModal()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-sm sm:text-base">Add Contact</span>
        </motion.button>
      </div>

      {/* Contact List */}
      <motion.div
        layout
        className="flex flex-col gap-3 sm:gap-4 bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-lg p-3 sm:p-4 transition-all min-h-[200px]"
      >
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-6 sm:p-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl text-center text-gray-700 w-full">
            <PlusCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h2 className="text-lg sm:text-xl font-semibold">No contacts yet</h2>
            <p className="text-xs sm:text-sm text-gray-600 px-4">Click the "Add Contact" button to create your first contact.</p>
          </div>
        ) : (
          <AnimatePresence>
            {pageItems.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor:
                    c.id === highlightedId ? "rgba(147, 197, 253, 0.25)" : "transparent",
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={`rounded-xl transition-colors w-full py-3 px-3 sm:px-4 ${
                  c.id === highlightedId ? "animate-pulse" : "hover:bg-gray-50"
                }`}
              >
                {/* Desktop View */}
                <div className="hidden lg:grid lg:grid-cols-[minmax(150px,1fr)_minmax(180px,1.2fr)_minmax(120px,0.8fr)_minmax(200px,1.5fr)_minmax(100px,0.7fr)_minmax(120px,auto)] gap-x-4 items-center">
                  <div className="flex items-center gap-2 font-semibold text-gray-800 min-w-0" title={c.name}>
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0" title={c.email}>
                    <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>

                  <div className="text-sm text-gray-700 truncate min-w-0" title={c.subject}>
                    {c.subject}
                  </div>

                  <div className="text-sm text-gray-700 truncate min-w-0 flex items-center gap-2" title={c.message}>
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{c.message}</span>
                  </div>

                  <div className="text-xs text-gray-500 truncate min-w-0 whitespace-nowrap flex items-center gap-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3 justify-end flex-shrink-0">
                    <button
                      onClick={() => handleOpenModal(c)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(c.id)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                    >
                      {isDeletingId === c.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-gray-800 flex-1 min-w-0">
                      <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(c.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        {isDeletingId === c.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>

                  {c.subject && (
                    <div className="text-sm text-gray-700 pl-6 truncate">
                      <span className="font-medium">Subject:</span> {c.subject}
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2 flex-1">{c.message}</p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 pl-6">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing <span className="font-semibold">{pageItems.length}</span> of{" "}
          <span className="font-semibold">{list.length}</span> contacts
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Prev</span>
          </motion.button>

          <div className="px-3 sm:px-4 py-1.5 border rounded-lg bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap">
            Page {page} / {totalPages}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(true)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingId ? "Edit Contact" : "Add New Contact"}
                </h2>
              </div>

              <div className="px-4 sm:px-6 py-4 flex flex-col gap-3 bg-gray-50 overflow-y-auto">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContactData.name}
                  onChange={(e) => setNewContactData((p) => ({ ...p, name: e.target.value }))}
                  className="border rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newContactData.email}
                  onChange={(e) => setNewContactData((p) => ({ ...p, email: e.target.value }))}
                  className="border rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={newContactData.subject}
                  onChange={(e) => setNewContactData((p) => ({ ...p, subject: e.target.value }))}
                  className="border rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  placeholder="Message"
                  value={newContactData.message}
                  onChange={(e) => setNewContactData((p) => ({ ...p, message: e.target.value }))}
                  rows={4}
                  className="border rounded-lg px-3 py-2 w-full resize-none text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={isSaving}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (editingId ? "Updating..." : "Adding...") : editingId ? "Update" : "Add"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirm Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 sm:p-6 flex flex-col gap-4"
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Discard Changes?</h3>
              <p className="text-gray-600 text-xs sm:text-sm">
                Are you sure you want to cancel? Your changes will not be saved.
              </p>

              <div className="flex justify-end gap-2 mt-2 sm:mt-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowCancelConfirm(false);
                  }}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 sm:p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Delete Contact?</h3>
                  <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2 sm:mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeletingId === showDeleteConfirm}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm) {
                      handleDeleteContact(showDeleteConfirm);
                    }
                  }}
                  disabled={isDeletingId === showDeleteConfirm}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingId === showDeleteConfirm ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

