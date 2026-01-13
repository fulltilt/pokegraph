import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
  const [labelFilter, setLabelFilter] = useState<
    "all" | "keep" | "remove" | "null"
  >("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["predictions", search, labelFilter, page, perPage],
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
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/label`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, label }),
        }
      );
      return res.json();
    },
    onMutate: async ({ id, label }) => {
      await queryClient.cancelQueries({ queryKey: ["predictions"] });

      const prev = queryClient.getQueryData([
        "predictions",
        search,
        labelFilter,
        page,
        perPage,
      ]);

      // Update in-place
      queryClient.setQueryData(
        ["predictions", search, labelFilter, page, perPage],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item: any) =>
              item.id === id ? { ...item, label } : item
            ),
          };
        }
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(
          ["predictions", search, labelFilter, page, perPage],
          ctx.prev
        );
      }
    },

    onSettled: () => {
      // Optional: only refetch if you need fresh totals
      // queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const autoLabelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ENDPOINT_URL}/api/sealed/auto-label`,
        { method: "POST" }
      );
      return res.json();
    },
    onSuccess: () => {
      // Refetch to show updated labels
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / perPage);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search title or product"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          value={labelFilter}
          onValueChange={(value: any) => setLabelFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by label" />
          </SelectTrigger>
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
          {autoLabelMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Labeling...
            </>
          ) : (
            "Auto-label"
          )}
        </Button>
      </div>

      {data?.stats && (
        <div className="flex gap-6 text-sm text-muted-foreground">
          <span>Total: {data.total}</span>
          <span>Keep: {data.stats.keep}</span>
          <span>Remove: {data.stats.remove}</span>
          <span>Unlabeled: {data.stats.unlabeled}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.items?.map((entry: SealedPriceEntry) => (
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

      <div className="flex justify-between items-center pt-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Results per page:
          </span>
          <Select
            value={perPage.toString()}
            onValueChange={(value) => {
              setPerPage(Number(value));
              setPage(1); // Reset to first page when changing page size
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
