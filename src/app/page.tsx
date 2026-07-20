'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  Film,
  Award,
  ChevronRight,
  Heart,
  Eye,
  Sparkles,
  Star,
  Globe,
  Zap
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type Manga = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  genre: string[];
  viewsCount: number;
  likesCount: number;
  author: { username: string };
};

type Creator = {
  id: string;
  username: string;
  avatarUrl: string;
  isCertified: boolean;
  _count: { mangas: number; followers: number };
};

// ============================================
// SVG ICONS
// ============================================
const IconManga = () => (
  <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="2" width="20" height="28" rx="2" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="6" y1="16" x2="14" y2="16" />
  </svg>
);

// ============================================
// PAGE
// ============================================
export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [topCreators, setTopCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const [mangasRes, creatorsRes] = await Promise.all([
          fetch(`${baseUrl}/mangas/top?limit=6`),
          fetch(`${baseUrl}/users/top-creators?limit=4`),
        ]);
        const mangas = await mangasRes.json();
        const creators = await creatorsRes.json();
        setTrending(mangas.data || []);
        setTopCreators(creators.data || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">

      {/* ===== HERO ===== */}
      <section className="relative py-20 md:py-32 text-center overflow-hidden bg-gradient-to-b from-accent/5 to-transparent">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium mb-6 animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            Beta ouverte — Rejoignez-nous
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4">
            Là où les <span className="text-accent">mangas</span><br />
            rencontrent l'<span className="text-accent">Afrique</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            La première plateforme manga où les créateurs du monde entier 
            sont payés en mobile money en quelques secondes.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-accent to-accent-dark hover:shadow-lg hover:shadow-accent/25 transition-all">
              <Link href="/discover">Commencer à lire</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/creator/upload">Publier mon manga</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Tendance cette semaine
            </h2>
            <Link href="/discover" className="text-accent hover:underline text-sm font-medium flex items-center gap-1">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun manga en tendance pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {trending.map((manga) => (
                <Link
                  key={manga.id}
                  href={`/manga/${manga.id}`}
                  className="group block bg-card rounded-xl overflow-hidden border border-border hover:border-accent transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-accent-dark/20 flex items-center justify-center">
                    <IconManga />
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
                      {manga.title}
                    </h3>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-3 w-3" /> {manga.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" /> {manga.viewsCount || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TOP CRÉATEURS ===== */}
      <section className="py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Meilleurs créateurs
            </h2>
            <Link href="/top" className="text-accent hover:underline text-sm font-medium flex items-center gap-1">
              Voir tout <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topCreators.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucun créateur pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {topCreators.map((creator, index) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.username}`}
                  className="group block bg-card border border-border rounded-xl p-4 text-center hover:border-accent transition-all hover:-translate-y-1"
                >
                  <div className="relative inline-block">
                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-accent to-accent-dark'}`}>
                      {creator.username.charAt(0).toUpperCase()}
                    </div>
                    {creator.isCertified && (
                      <span className="absolute -top-1 -right-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm mt-2 truncate">{creator.username}</p>
                  <div className="flex justify-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>📚 {creator._count?.mangas || 0}</span>
                    <span>👥 {creator._count?.followers || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Pourquoi <span className="text-accent">INKDROP</span> ?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-base mb-1">Mobile Money</h3>
              <p className="text-muted-foreground text-sm">Paiements instantanés en M-Pesa, Orange Money, Airtel.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-base mb-1">70% pour les créateurs</h3>
              <p className="text-muted-foreground text-sm">Les dessinateurs reçoivent l'argent directement.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Film className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-base mb-1">InkStream</h3>
              <p className="text-muted-foreground text-sm">Animes en streaming avec vos MANAS.</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-center hover:border-accent transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Award className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-base mb-1">Certification ⭐</h3>
              <p className="text-muted-foreground text-sm">Badge certifié pour les meilleurs créateurs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-12 bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-accent">12k+</p>
              <p className="text-muted-foreground text-sm">Mangas publiés</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">3k+</p>
              <p className="text-muted-foreground text-sm">Créateurs actifs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">1.8M</p>
              <p className="text-muted-foreground text-sm">Pages lues</p>
            </div>
            <div>
              <div className="w-10 h-10 mx-auto mb-2">
                <Globe className="w-10 h-10 text-accent" />
              </div>
              <p className="text-muted-foreground text-sm">Pays représentés</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA PREMIUM ===== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-accent/20 to-accent-dark/20 rounded-2xl p-8 md:p-12 text-center border border-accent/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <Zap className="h-6 w-6 text-accent" />
              INKDROP Premium
            </h2>
            <p className="text-muted-foreground mb-4">
              Sans pub · Accès illimité · Accès anticipé
            </p>
            <p className="text-3xl font-bold text-accent mb-6">2$ <span className="text-base font-normal text-muted-foreground">/ mois</span></p>
            <Button asChild size="lg" className="bg-gradient-to-r from-accent to-accent-dark">
              <Link href="/premium">Devenir Premium</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}