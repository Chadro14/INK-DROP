import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          INKDROP
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          La plateforme de mangas et animes
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/discover">Explorer</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/inkstream">InkStream</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}