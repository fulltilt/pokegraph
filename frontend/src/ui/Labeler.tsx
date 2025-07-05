import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SealedPriceEntry } from "@/types";

const API_BASE = `${import.meta.env.VITE_ENDPOINT_URL}`;

export async function fetchUnlabeledEntries(): Promise<SealedPriceEntry[]> {
  const res = await fetch(`${API_BASE}/api/sealed/unlabeled`);
  if (!res.ok) throw new Error("Failed to fetch entries");
  return res.json();
}

export async function labelSealedEntry(
  id: string,
  label: "keep" | "remove"
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/sealed/label`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, label }),
  });
  if (!res.ok) throw new Error("Failed to label entry");
}

function Labeler() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<
    SealedPriceEntry[],
    Error
  >({
    queryKey: ["sealed-entries"],
    queryFn: fetchUnlabeledEntries,
  });

  const mutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: "keep" | "remove" }) =>
      labelSealedEntry(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealed-entries"] });
    },
  });

  const handleLabel = (id: string, label: "keep" | "remove") => {
    mutation.mutate({ id, label });
  };

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Label Sealed Listings</h1>

      {data && data.length === 0 && <p>No unlabeled entries 🎉</p>}

      {data?.map((entry) => (
        <div key={entry.id} className="mb-4 border p-4 rounded shadow">
          <p>
            <strong>Product:</strong> {entry.product}
          </p>
          <p>
            <strong>Title:</strong> {entry.title}
          </p>
          <p>
            <strong>Price:</strong> ${entry.price.toFixed(2)}
          </p>
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            View
          </a>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => handleLabel(entry.id, "keep")}
              disabled={mutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
            >
              Keep
            </button>
            <button
              onClick={() => handleLabel(entry.id, "remove")}
              disabled={mutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Labeler;
