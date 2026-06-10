import { PublicLayout } from '@/components/layout/PublicLayout';
import { NewsCard } from '@/components/ui/NewsCard';
import { mockNews } from '@/data/mock-news';

export default function Noticias() {
  return (
    <PublicLayout>
      <div className="p-24 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Noticias</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockNews.map(n => (
            <NewsCard key={n.id} news={n} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
