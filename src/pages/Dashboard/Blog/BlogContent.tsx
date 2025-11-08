import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface Props {
  html: string;
  setHtml: (val: string) => void;
  setDirty: (val: boolean) => void;
}

export default function BlogContent({ html, setHtml, setDirty }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        Blog Content
      </label>
      <ReactQuill
        theme="snow"
        value={html}
        onChange={(content) => {
          setHtml(content);
          setDirty(true);
        }}
        className="bg-white rounded-lg border border-gray-200 shadow-inner"
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "clean"],
          ],
        }}
      />
      <p className="text-xs text-gray-500 mt-2 italic">
        Format text with the toolbar or paste pre-formatted content.
      </p>
    </div>
  );
}
