interface Props {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, description, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title ?? "Confirm"}</h3>
        <p className="text-sm text-gray-600 mt-2">{description ?? "Are you sure?"}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
}
