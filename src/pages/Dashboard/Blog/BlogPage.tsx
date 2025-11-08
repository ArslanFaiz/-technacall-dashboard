import { useEffect, useState } from "react";
import type { Blog } from "../../../types";
import BlogForm from "./BlogForm";
import ConfirmModal from "./ConfirmModal";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Edit3, Trash2 } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { getBlogs, deleteBlog, publishBlog, unpublishBlog } from "../../../api/api";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string; action?: string }>({
    open: false,
  });

  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(blogs.length / pageSize);
  const paginatedBlogs = blogs.slice((page - 1) * pageSize, page * pageSize);

  // Track loading for publish/unpublish buttons
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fetch blogs on mount
  useEffect(() => {
    const fetchBlogsData = async () => {
      try {
        const data = await getBlogs();
        const normalizedBlogs: Blog[] = data.map((b: any) => ({
          ...b,
          images: b.images?.map((i: any) => i.imageUrl) ?? [],
          content: b.content ?? b.description,
        }));
        setBlogs(normalizedBlogs);
      } catch (err) {
        console.error(err);
        setBlogs([]);
      }
    };
    fetchBlogsData();
  }, []);

  // Disable scroll when form is open
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "";
  }, [showForm]);

  // Add Blog
  const handleAddClick = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleCreate = (data: Omit<Blog, "id" | "createdAt">) => {
    const newBlog: Blog = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    setBlogs((p) => [newBlog, ...p]);
    setShowForm(false);
  };

  // Update Blog
  const handleUpdate = (id: string, data: Partial<Blog>) => {
    setBlogs((p) => p.map((b) => (b.id === id ? { ...b, ...data } : b)));
    setEditing(null);
    setShowForm(false);
  };

  // Delete Blog
  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoadingId(id); // start loading
    try {
      await deleteBlog(id);
      setBlogs((p) => p.filter((b) => b.id !== id));
      setConfirm({ open: false });
      toast.success("Blog deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting the blog.");
    } finally {
      setLoadingId(null); // stop loading
    }
  };


  // Publish Blog
  const handlePublish = async (id?: string) => {
    if (!id) return;
    setLoadingId(id);
    try {
      await publishBlog(id);
      setBlogs((p) =>
        p.map((b) => (b.id === id ? { ...b, status: "PUBLISHED" } : b))
      );
      toast.success("Blog published successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while publishing the blog.");
    } finally {
      setLoadingId(null);
    }
  };

  // Unpublish Blog
  const handleUnpublish = async (id?: string) => {
    if (!id) return;
    setLoadingId(id);
    try {
      await unpublishBlog(id);
      setBlogs((p) =>
        p.map((b) => (b.id === id ? { ...b, status: "DRAFT" } : b))
      );
      toast.success("Blog unpublished successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred while unpublishing the blog.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6 ">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Blog Manager
        </h1>

        <button
          onClick={handleAddClick}
          className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 duration-300"
        >
          <PlusCircle className="w-5 h-5" />
          Add Blog
        </button>
      </div>

      {/* Blog List */}
      {blogs.length === 0 ? (
        <div className="p-8 sm:p-10 bg-white rounded-2xl shadow-sm border border-gray-200 text-gray-600 text-center">
          No blogs yet — <span className="text-blue-600 font-medium">click “Add Blog”</span> to create one!
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence>
              {paginatedBlogs.map((b) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="group mb-5 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200/70"
                >
                  {/* Header */}
                  <div className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <span className="text-xs font-semibold tracking-wide">{b.category ?? "General"}</span>
                    <span className="text-[10px] text-white/80">{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Image */}
                  {Array.isArray(b.images) && b.images.length > 0 && (
                    <div className="relative w-full h-[200px] sm:h-[260px] lg:h-[280px] overflow-hidden bg-gray-100 rounded-b-lg">
                      <img
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        src={b.images[0]}
                        alt={b.title}
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {b.title}
                    </h3>

                    <div
                      className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: (b.content ?? "").slice(0, 220) + ((b.content ?? "").length > 220 ? "..." : ""),
                      }}
                    />

                    <span
                      className={`px-2 py-1 text-xs rounded-full ${b.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {b.status ?? "DRAFT"}
                    </span>

                    <hr className="border-gray-200 mt-2" />

                    {/* Buttons */}
<div className="flex flex-col md:flex-row items-center gap-3 flex-wrap md:justify-start">
  <button
    onClick={() => {
      setEditing(b);
      setShowForm(true);
    }}
    className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
  >
    <Edit3 className="w-4 h-4" />
    Edit
  </button>

  <button
    onClick={() => setConfirm({ open: true, id: b.id, action: "delete" })}
    disabled={loadingId === b.id}
    className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
  >
    {loadingId === b.id ? "Deleting..." : (
      <>
        <Trash2 className="w-4 h-4" />
        Delete
      </>
    )}
  </button>

  {b.status === "PUBLISHED" ? (
    <button
      onClick={() => handleUnpublish(b.id)}
      disabled={loadingId === b.id}
      className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loadingId === b.id ? "Loading..." : "Unpublish"}
    </button>
  ) : (
    <button
      onClick={() => handlePublish(b.id)}
      disabled={loadingId === b.id}
      className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 whitespace-nowrap"
    >
      {loadingId === b.id ? "Loading..." : "Publish"}
    </button>
  )}
</div>


                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {blogs.length > pageSize && (
            <div className="flex justify-center items-center gap-4 mt-8 flex-wrap mb-5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-40 w-full sm:w-auto"
              >
                Previous
              </button>

              <span className="text-sm font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border disabled:opacity-40 w-full sm:w-auto"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Blog Form */}
      <AnimatePresence>
        {showForm && (
          <BlogForm
            initial={editing ?? undefined}
            onClose={() => {
              setShowForm(false);
              setEditing(null);
            }}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={confirm.open}
        title="Delete blog"
        description="Are you sure you want to delete this blog?"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => handleDelete(confirm.id)}
      />
    </div>
  );
}
