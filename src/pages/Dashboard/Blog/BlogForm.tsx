import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Blog } from "../../../types";
import "react-quill-new/dist/quill.snow.css";
import toast, { Toaster } from "react-hot-toast";
import { createBlog, updateBlog } from "../../../api/api";

import BlogTitle from "./BlogTitle";
import BlogImages from "./BlogImages";
import BlogContent from "./BlogContent";
import BlogActions from "./BlogActions";
import ConfirmCloseModal from "./ConfirmCloseModal";

interface Props {
  initial?: Blog;
  onClose: () => void;
  onCreate: (data: Omit<Blog, "id" | "createdAt">) => void;
  onUpdate: (id: string, data: Partial<Blog>) => void;
}

export default function BlogForm({ initial, onClose, onCreate, onUpdate }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [html, setHtml] = useState(initial?.content ?? "");
  const [dirty, setDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (files: File[]) => {
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
      reader.readAsDataURL(file);
    });
    setDirty(true);
  };

  const handleCancel = () => {
    if (dirty) return setShowConfirm(true);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter a title");

    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("You are not logged in");

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", html);
    formData.append("tags", "technology, programming");
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      let blogData;
      if (initial) {
        blogData = await updateBlog(initial.id, formData, token);
        toast.success("Blog updated successfully");
        onUpdate(initial.id, {
          ...blogData,
          content: blogData.content ?? blogData.description,
          images: blogData.images?.map((im: any) => im.imageUrl) ?? [],
        });
      } else {
        blogData = await createBlog(formData, token);
        toast.success("Blog created successfully");
        onCreate({
          ...blogData,
          content: blogData.content ?? blogData.description,
          images: blogData.images?.map((im: any) => im.imageUrl) ?? [],
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <AnimatePresence>
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            key="form"
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
              <h3 className="text-xl font-semibold tracking-wide drop-shadow-sm">
                {initial ? "Edit Blog" : "Create New Blog"}
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                className="text-white/90 hover:text-white transition text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white"
            >
              <BlogTitle title={title} setTitle={setTitle} setDirty={setDirty} />
              <BlogImages images={images} onFilesChange={handleImageChange} />
              <BlogContent html={html} setHtml={setHtml} setDirty={setDirty} />
              <BlogActions loading={loading} handleCancel={handleCancel} initial={initial} />
            </form>
          </motion.div>

          {showConfirm && (
            <ConfirmCloseModal onClose={() => setShowConfirm(false)} onConfirm={onClose} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
