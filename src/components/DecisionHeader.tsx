import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DecisionHeaderProps {
  title: string;
  updatedAt: string;
  onTitleChange: (title: string) => void;
}

function formatUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return 'just now';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function DecisionHeader({
  title,
  updatedAt,
  onTitleChange,
}: DecisionHeaderProps) {
  return (
    <header className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,380px)]">
      <Card className="bg-white/[0.66]">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Decision workspace
          </p>
          <CardTitle className="text-3xl sm:text-4xl">
            Shape the matrix below the reflection.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            Name the decision, define the options in front of you, then weight
            and score each category to surface a recommendation that feels
            grounded.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-[rgba(255,250,245,0.82)]">
        <CardHeader className="pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Current decision
          </p>
          <CardTitle className="text-2xl">Set the working title</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label
            className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            htmlFor="decision-title"
          >
            Decision title
          </label>
          <Input
            className="h-[3.25rem] rounded-[20px] text-base"
            id="decision-title"
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Untitled decision"
            value={title}
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Last updated {formatUpdatedAt(updatedAt)}
          </p>
        </CardContent>
      </Card>
    </header>
  );
}
