import { Input } from "../../../components";

interface Props {
  title: string;
  setTitle: (val: string) => void;
  setDirty: (val: boolean) => void;
}

export default function BlogTitle({ title, setTitle, setDirty }: Props) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1 text-gray-700">
        Blog Title
      </label>
      <Input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setDirty(true);
        }}
        placeholder="Enter an engaging title..."
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white/90 shadow-sm"
      />
    </div>
  );
}
