import Link from "next/link"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Project } from "@/data/mock-projects"

export function ProjectCard({ project }: { project: Project }) {
  const statusColor = {
    'Planificación': 'secondary',
    'Activo': 'success',
    'En seguimiento': 'warning',
    'Finalizado': 'default'
  } as const;

  return (
    <Card className="h-full flex flex-col hover:border-accent hover:shadow-md transition-all group overflow-hidden">
      <div className="h-48 bg-muted w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge 
          className="absolute top-4 right-4" 
          variant={statusColor[project.status]}
        >
          {project.status}
        </Badge>
        <div className="absolute bottom-4 left-4 text-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-hover">
            {project.category}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2 group-hover:text-accent transition-colors">
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted line-clamp-3 mb-4">
          {project.description}
        </p>
        <div className="flex items-center text-xs text-muted font-medium mt-auto">
          <Calendar className="w-4 h-4 mr-2" />
          {project.date}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link 
          href={`/proyectos/${project.id}`} 
          className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          Ver proyecto &rarr;
        </Link>
      </CardFooter>
    </Card>
  )
}
