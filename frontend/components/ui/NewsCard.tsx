import Link from "next/link"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { News } from "@/data/mock-news"

export function NewsCard({ news }: { news: News }) {
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow group">
      <CardHeader>
        <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          {news.category}
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-accent transition-colors">
          {news.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted line-clamp-3">
          {news.summary}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-0 border-t border-border mt-4">
        <div className="flex items-center text-xs text-muted mt-4">
          <Calendar className="w-4 h-4 mr-2" />
          {news.date}
        </div>
        <Link 
          href={`/noticias/${news.id}`} 
          className="text-sm font-semibold text-accent hover:text-accent-hover transition-colors mt-4"
        >
          Leer más &rarr;
        </Link>
      </CardFooter>
    </Card>
  )
}
