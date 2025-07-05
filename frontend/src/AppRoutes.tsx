// AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Main from "./ui/Main";
import Sets from "./ui/Sets";
import Set from "./ui/Set";
import Card from "./ui/Card";
import Sealed from "./ui/Sealed";
import Labeler from "./ui/Labeler";
import Predictions from "./ui/Predictions";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="sets" element={<Sets />} />
        <Route path="sets/:id" element={<Set />} />
        <Route path="card/:id" element={<Card />} />
        <Route path="sealed" element={<Sealed />} />
        <Route path="label" element={<Labeler />} />
        <Route path="predictions" element={<Predictions />} />
      </Route>
    </Routes>
  );
}
