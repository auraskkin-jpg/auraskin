import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Eye, RefreshCw, Users } from 'lucide-react';
import { getAnalytics, type AnalyticsSummary } from '../utils/api';

interface AdminAnalyticsProps {
  token: string;
}

export function AdminAnalytics({ token }: AdminAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      setAnalytics(await getAnalytics(token));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Chargement des statistiques impossible.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const metrics = analytics
    ? [
        { label: 'Visiteurs uniques — aujourd’hui', value: analytics.today.visitors, icon: Users },
        { label: 'Pages vues — aujourd’hui', value: analytics.today.pageViews, icon: Eye },
        { label: 'Visiteurs uniques — 7 jours', value: analytics.last7Days.visitors, icon: Users },
        { label: 'Pages vues — 7 jours', value: analytics.last7Days.pageViews, icon: Eye },
        { label: 'Visiteurs uniques — 30 jours', value: analytics.last30Days.visitors, icon: Users },
        { label: 'Pages vues — 30 jours', value: analytics.last30Days.pageViews, icon: Eye },
      ]
    : [];
  const maxDailyTraffic = analytics
    ? Math.max(1, ...analytics.daily.map((day) => Math.max(day.visitors, day.pageViews)))
    : 1;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-brand text-2xl font-semibold">Statistiques du site</h2>
          <p className="text-xs text-[#141414]/60">Visiteurs estimés, pages vues et pages populaires.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadAnalytics()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full border border-[#141414]/15 bg-white px-4 py-2.5 text-xs font-semibold disabled:opacity-60"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {isLoading && !analytics && <p className="text-sm text-[#141414]/60">Chargement des statistiques…</p>}

      {analytics && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-[#141414]/60">{label}</p>
                  <Icon size={17} className="shrink-0 text-[#e0558b]" />
                </div>
                <p className="mt-3 font-brand text-3xl font-semibold">{value.toLocaleString('fr-FR')}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="overflow-hidden rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={17} className="text-[#e0558b]" />
                <h3 className="font-semibold">Activité des 14 derniers jours</h3>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-[#141414]/60">
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#e0558b]" /> Visiteurs</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#141414]" /> Pages vues</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <div className="grid min-w-[560px] grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
                  {analytics.daily.map((day) => (
                    <div key={day.date} className="text-center" title={`${day.visitors} visiteurs, ${day.pageViews} pages vues`}>
                      <div className="flex h-36 items-end justify-center gap-1">
                        <div
                          className="w-2.5 rounded-t bg-[#e0558b] sm:w-3"
                          style={{ height: `${(day.visitors / maxDailyTraffic) * 100}%` }}
                        />
                        <div
                          className="w-2.5 rounded-t bg-[#141414] sm:w-3"
                          style={{ height: `${(day.pageViews / maxDailyTraffic) * 100}%` }}
                        />
                      </div>
                      <span className="mt-2 block text-[9px] text-[#141414]/50">
                        {new Date(`${day.date}T00:00:00`).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#141414]/10 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="font-semibold">Pages les plus vues — 30 jours</h3>
              {analytics.popularPages.length > 0 ? (
                <div className="mt-3 divide-y divide-[#141414]/5">
                  {analytics.popularPages.map((page) => (
                    <div key={page.path} className="flex items-center justify-between gap-3 py-3 text-xs">
                      <span className="min-w-0 truncate font-medium" title={page.path}>{page.path}</span>
                      <span className="shrink-0 text-right text-[#141414]/60">
                        {page.pageViews.toLocaleString('fr-FR')} vues
                        <span className="block text-[10px]">{page.visitors.toLocaleString('fr-FR')} visiteurs</span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-[#141414]/55">Aucune visite enregistrée pour le moment.</p>
              )}
            </section>
          </div>

          <p className="text-[11px] leading-relaxed text-[#141414]/55">
            Les visiteurs uniques sont estimés à partir d’un identifiant aléatoire conservé dans leur navigateur.
            Aucun nom, e-mail ou adresse IP n’est enregistré; une personne utilisant plusieurs navigateurs peut compter plusieurs fois.
          </p>
        </>
      )}
    </section>
  );
}
