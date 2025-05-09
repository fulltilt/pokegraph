import { Route, Routes } from "react-router-dom";
import Sets from "./ui/Sets";
import Main from "./ui/Main";
import Card from "./ui/Card";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/sets" element={<Sets />} />
      <Route path="/card/:id" element={<Card />} />
    </Routes>
  );
}
