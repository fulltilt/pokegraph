import { useCardSearch } from "@/hooks/useCardSearch";
import { useState } from "react";

export default function CardSearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const { results, loading } = useCardSearch(searchTerm);

  return (
    <div className="p-4">
      <input
        className="border p-2 rounded w-full"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search card..."
      />
      {loading && <p>Loading...</p>}
      {results.length === 0 && !loading && searchTerm && (
        <p>No results found.</p>
      )}
      <ul>
        {results.map((card) => (
          <li key={card.id}>{card.data?.name ?? "Unnamed card"}</li>
        ))}
      </ul>
    </div>
  );
}
