import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  User,
  Phone,
  Mail,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Edit3,
  Trash2,
} from "lucide-react";
import type { Booking } from "../../../types";
import api from "../../../api/api";
import toast, { Toaster } from "react-hot-toast";

const KEY = "dashboard_bookings_v1";

export default function BookingPage() {
  const [list, setList] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    details: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [search, setSearch] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const perPage = 10;

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setList(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(list));
  }, [list]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/bookings", {
          params: {
            page,
            limit: perPage,
          },
        });

        const data = res.data;

        if (!data.success) {
          toast.error(data.message || "Failed to fetch bookings");
          return;
        }

        const fetchedItems = data.data.bookings.map((b: any) => ({
          id: b.id,
          name: b.name ?? "",
          phone: b.phone ?? "",
          email: b.email ?? "",
          details: b.message ?? "",
          date: b.date ?? "", // keep full timestamp
        }));

        setList(fetchedItems);
        localStorage.setItem(KEY, JSON.stringify(fetchedItems));
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, [page]);

  // ✅ ADD BOOKING
  const handleAdd = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        date: `${form.date}T23:59:59.999Z`,
        message: form.details,
      };

      const res = await fetch(
        "https://technacallcanadabackend-production.up.railway.app/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Error booking");
        return;
      }

      const newItem = {
        ...form,
        id: data.data.booking.id,
        date: new Date().toISOString(), // store exact timestamp
      };
      setList((p) => [newItem, ...p]);
      toast.success("✅ Booking created successfully");

      setModalOpen(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        details: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE BOOKING
  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (!editingId) return;

      const token = localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You are not logged in");
        return;
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        date: `${form.date}T23:59:59.999Z`,
        message: form.details,
      };

      const res = await fetch(
        `https://technacallcanadabackend-production.up.railway.app/api/bookings/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Error updating booking");
        return;
      }

      setList((p) =>
        p.map((item) =>
          item.id === editingId
            ? { ...item, ...form, date: new Date().toISOString() } // update timestamp
            : item
        )
      );

      toast.success("✅ Booking updated successfully");

      setHighlightedId(editingId);
      setTimeout(() => setHighlightedId(null), 1500);

      setEditingId(null);
      setModalOpen(false);
      setForm({
        name: "",
        phone: "",
        email: "",
        details: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      console.log(error);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FILTER
  const filteredList = list.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.date?.includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filteredList.length / perPage));
  const pageItems = filteredList.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8 lg:p-10 mb-6">
      <Toaster position="top-right" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3 sm:gap-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          System Bookings
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-xl p-2 focus:ring-2 ring-blue-500 w-full sm:w-auto text-sm sm:text-base"
          />
          <button
            onClick={() => {
              setEditingId(null);
              setForm({
                name: "",
                phone: "",
                email: "",
                details: "",
                date: new Date().toISOString().slice(0, 10),
              });
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 duration-300 w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Booking
          </button>
        </div>
      </div>

      {/* ✅ Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
            <button
              onClick={() => {
                setEditingId(null);
                setShowConfirm(true);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Update Booking" : "Add Booking"}
            </h2>

            <div className="space-y-4">
              {Object.keys(form).map((key) => (
                <input
                  key={key}
                  type={key === "date" ? "date" : "text"}
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={(form as any)[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  className="w-full border rounded-lg p-2 focus:ring-2 ring-blue-500"
                />
              ))}

              {/* ✅ Dynamic Save / Update */}
              <button
                onClick={() => (editingId ? handleUpdate() : handleAdd())}
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                {loading ? (editingId ? "Updating..." : "Saving...") : editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Confirm Close */}
      <AnimatePresence>
        {showConfirm && (
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
              <h4 className="text-lg font-semibold mb-3 text-gray-800">
                Unsaved Changes
              </h4>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to close this form? Your unsaved edits will be lost.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition"
                >
                  No
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setEditingId(null);
                    setModalOpen(false);
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Yes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ TABLE */}
      <motion.div
        layout
        className="bg-white rounded-2xl shadow-lg border border-gray-200 transition-all w-full overflow-hidden"
      >
        <div className="w-full overflow-x-auto max-h-[70vh] hidden sm:block">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <th className="p-3 font-semibold text-left whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" /> Name
                  </div>
                </th>
                <th className="p-3 font-semibold text-left whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> Phone
                  </div>
                </th>
                <th className="p-3 font-semibold text-left whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> Email
                  </div>
                </th>
                <th className="p-3 font-semibold text-left whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" /> Date and Time
                  </div>
                </th>
                <th className="p-3 font-semibold text-left">Actions</th>
              </tr>
            </thead>

            <AnimatePresence>
              <tbody>
                {pageItems.map((b) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundColor:
                        b.id === highlightedId
                          ? "rgba(59, 130, 246, 0.12)"
                          : "transparent",
                    }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className={`border-b border-gray-200 transition-colors text-xs sm:text-sm md:text-base lg:text-base ${
                      b.id === highlightedId ? "animate-pulse" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-800 break-words max-w-[120px] sm:max-w-[150px] md:max-w-none">{b.name}</td>
                    <td className="p-3 text-gray-700 break-words max-w-[100px] sm:max-w-[120px] md:max-w-none">{b.phone}</td>
                    <td className="p-3 text-gray-700 break-words max-w-[150px] sm:max-w-[200px] md:max-w-none">{b.email}</td>
                    <td className="p-3 text-gray-600 whitespace-nowrap">
                      {b.date
                        ? new Date(b.date).toLocaleString(undefined, {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </td>

                    <td className="p-3 text-gray-700 flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setEditingId(b.id);
                          setForm({
                            name: b.name ?? "",
                            phone: b.phone ?? "",
                            email: b.email ?? "",
                            details: b.details ?? (b as any).message ?? "",
                            date: (b.date ?? "").slice(0, 10),
                          });
                          setModalOpen(true);
                        }}
                        className="p-1 bg-blue-100 rounded hover:bg-blue-200 transition flex items-center justify-center"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(b.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-1 bg-red-100 rounded hover:bg-red-200 transition flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
        {/* Mobile card list */}
        <div className="sm:hidden max-h-[70vh] overflow-y-auto divide-y">
          <AnimatePresence>
            {pageItems.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor:
                    b.id === highlightedId ? "rgba(59, 130, 246, 0.12)" : "transparent",
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={`p-4 space-y-2 ${b.id === highlightedId ? "animate-pulse" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="break-words">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(b.id);
                        setForm({
                          name: b.name ?? "",
                          phone: b.phone ?? "",
                          email: b.email ?? "",
                          details: b.details ?? (b as any).message ?? "",
                          date: (b.date ?? "").slice(0, 10),
                        });
                        setModalOpen(true);
                      }}
                      className="p-1.5 bg-blue-100 rounded hover:bg-blue-200 transition"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(b.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1.5 bg-red-100 rounded hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="break-words">{b.phone || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="break-words">{b.email || '-'}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="whitespace-nowrap">
                      {b.date
                        ? new Date(b.date).toLocaleString(undefined, {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                            timeZone: 'UTC',
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ✅ Delete Confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
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
              <h4 className="text-lg font-semibold mb-3 text-gray-800">
                Delete Booking
              </h4>
              <p className="text-gray-600 mb-6 text-sm">
                Are you sure you want to delete this booking? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded border border-gray-300 bg-white hover:bg-gray-100 transition"
                >
                  No
                </button>

                {/* ✅ API Delete */}
                <button
                  onClick={async () => {
                    if (!deleteId) return;
                    setDeleteLoadingId(deleteId); // start loading
                    try {
                      const token = localStorage.getItem("accessToken");
                      if (!token) {
                        alert("You are not logged in");
                        return;
                      }

                      const res = await fetch(
                        `https://technacallcanadabackend-production.up.railway.app/api/bookings/${deleteId}`,
                        {
                          method: "DELETE",
                          headers: {
                            accept: "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        alert(data.message || "Error deleting booking");
                        return;
                      }

                      setList((prev) => prev.filter((item) => item.id !== deleteId));
                      toast.success("✅ Booking deleted successfully");
                      setDeleteId(null);
                    } catch (e) {
                      alert("Network error");
                    } finally {
                      setDeleteLoadingId(null); // stop loading
                      setShowDeleteConfirm(false); // close modal
                    }
                  }}
                  disabled={deleteLoadingId === deleteId} // disable while loading
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                >
                  {deleteLoadingId === deleteId ? "Deleting..." : "Yes"}
                </button>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Pagination */}
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0 w-full">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left w-full sm:w-auto">
          Showing <span className="font-semibold">{pageItems.length}</span> of <span className="font-semibold">{filteredList.length}</span> bookings
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40 w-full sm:w-auto"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Prev
          </button>

          <div className="px-3 sm:px-4 py-1.5 border rounded-lg bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 text-center w-full sm:w-auto">
            Page {page} / {totalPages}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 border rounded-lg shadow-sm text-xs sm:text-sm font-medium transition-all hover:bg-gray-50 disabled:opacity-40 w-full sm:w-auto"
          >
            Next <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
