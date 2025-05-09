import { Card } from "@/types";
import { useEffect, useRef, useState } from "react";

export default function CardGrid({ set }: { set: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(
      `${
        import.meta.env.VITE_ENDPOINT_URL
      }/api/cards?set=${set}&page=${page}&pageSize=${pageSize}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.length < pageSize) setHasMore(false);
        setCards((prev) => {
          const all = [...prev, ...data];
          const unique = Array.from(
            new Map(all.map((card) => [card.id, card])).values()
          );
          return unique;
        });
      })
      .finally(() => setIsLoading(false));
  }, [page, set]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          setPage((prev) => prev + 1); // Correctly updates based on previous value
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [isLoading]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 m-12">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer"
          >
            <a href={`/card/${card.id}`}>
              <img
                src={card.image}
                alt={card.name}
                className="w-full h-auto object-cover"
              />
              <div className="p-2 text-sm font-medium text-center">
                {card.name}
              </div>
            </a>
          </div>
        ))}
      </div>
      {hasMore && <div ref={loaderRef} className="h-16" />}
    </>
  );
}
