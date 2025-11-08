import React from "react";
import { motion } from "framer-motion";

interface Props {
  images: string[];
  onFilesChange: (files: File[]) => void;
}

export default function BlogImages({ images, onFilesChange }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    onFilesChange(Array.from(e.target.files));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        Blog Images (optional)
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="text-sm text-gray-600 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
      />
      {images.length > 0 && (
        <div className="flex gap-3 flex-wrap mt-3">
          {images.map((img, i) => (
            <motion.img
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={img}
              alt="preview"
              className="mt-3 w-24 h-20 object-cover rounded-lg border shadow-md"
            />
          ))}
        </div>
      )}
    </div>
  );
}
