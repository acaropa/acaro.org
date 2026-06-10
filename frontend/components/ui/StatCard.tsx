import { Card, CardContent } from "./card"

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="flex flex-col justify-center items-center text-center p-6 bg-surface/50 border-border/50">
      {icon && <div className="mb-4 text-accent">{icon}</div>}
      <CardContent className="p-0">
        <h4 className="text-3xl font-bold text-primary mb-2">{value}</h4>
        <p className="text-sm font-medium text-muted uppercase tracking-wider">{title}</p>
      </CardContent>
    </Card>
  )
}
