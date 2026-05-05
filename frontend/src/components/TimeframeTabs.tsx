import { cn } from "@/lib/utils";

type TimeframeOption = {
  label: string;
  value: string;
};

type TimeframeTabsProps = Readonly<{
  options: readonly TimeframeOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}>;

export function TimeframeTabs(props: TimeframeTabsProps) {
  const { options, value, onChange, className } = props;

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-background/70 p-1 shadow-sm backdrop-blur",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium tracking-tight transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
