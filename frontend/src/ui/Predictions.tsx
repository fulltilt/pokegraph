// src/pages/Predictions.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface SealedPriceEntry {
  id: string;
  title: string;
  price: number;
  soldAt: string;
  label: "keep" | "remove" | null;
  confidence: number | null;
  url: string;
  sealed: {
    product: string;
  };
}

export default function Predictions() {
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["predictions", search, labelFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        perPage: perPage.toString(),
      });
      if (search) params.append("search", search);
      if (labelFilter !== "all") params.append("label", labelFilter);
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/predictions?${params}`
      );
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      id,
      label,
    }: {
      id: string;
      label: "keep" | "remove" | null;
    }) => {
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/${id}/label`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label }),
        }
      );
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["predictions"] }),
  });

  const autoLabelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/auto-label`,
        { method: "POST" }
      );
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["predictions"] }),
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search title or product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={labelFilter} onValueChange={setLabelFilter}>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="keep">Keep</SelectItem>
            <SelectItem value="remove">Remove</SelectItem>
            <SelectItem value="null">Unlabeled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => autoLabelMutation.mutate()}
          disabled={autoLabelMutation.isPending}
        >
          Auto-label
        </Button>
      </div>

      {data?.stats && (
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Total: {data.stats.total}</span>
          <span>Keep: {data.stats.keep}</span>
          <span>Remove: {data.stats.remove}</span>
          <span>Unlabeled: {data.stats.unlabeled}</span>
        </div>
      )}

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.items.map((entry: SealedPriceEntry) => (
            <Card key={entry.id}>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-medium">{entry.sealed.product}</p>
                <p className="text-sm">{entry.title}</p>
                <p className="text-sm text-muted-foreground">
                  ${entry.price.toFixed(2)}
                </p>
                {/* {entry.confidence !== null && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(entry.confidence * 100).toFixed(1)}%
                    </p>
                    <Progress value={entry.confidence * 100} className="h-1" />
                  </div>
                )} */}
                <div className="flex gap-2">
                  <Button
                    variant={entry.label === "keep" ? "default" : "outline"}
                    onClick={() =>
                      mutation.mutate({ id: entry.id, label: "keep" })
                    }
                  >
                    Keep
                  </Button>
                  <Button
                    variant={
                      entry.label === "remove" ? "destructive" : "outline"
                    }
                    onClick={() =>
                      mutation.mutate({ id: entry.id, label: "remove" })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span>Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * perPage >= (data?.total || 0)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
