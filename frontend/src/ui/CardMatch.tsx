import { useState, ChangeEvent } from "react";

interface CardMatch {
  id: string;
  name: string;
  imageUrl: string;
  distance: number;
}

interface MatchResponse {
  matches: CardMatch[];
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CardMatch[] | null>(null);

  const handleUpload = async (): Promise<void> => {
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("http://localhost:3000/api/match", {
      method: "POST",
      body: formData,
    });

    const data: MatchResponse = await res.json();
    setResult(data.matches);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Pokémon Card Matcher</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Find Match</button>
      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Top Matches</h2>
          {result.map((r, i) => (
            <div key={i}>
              <strong>{r.name}</strong> (distance: {r.distance.toFixed(4)})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
