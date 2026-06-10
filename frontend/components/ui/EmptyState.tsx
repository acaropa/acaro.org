import { FileQuestion } from "lucide-react"

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-border bg-surface/30">
      <div className="bg-surface p-4 rounded-full mb-4 text-muted">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted max-w-sm mx-auto">{description}</p>
    </div>
  )
}
