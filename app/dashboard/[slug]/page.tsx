import { notFound } from "next/navigation"
import { getLinkAnalytics } from "@/lib/analytics"
import { prisma } from "@/lib/prisma"
import { StatCard } from "@/components/analytics/stat-card"
import { ClicksChart } from "@/components/analytics/clicks-chart"
import { HorizontalBarChart } from "@/components/analytics/bar-chart"
import { formatDate, truncateUrl } from "@/lib/utils"

interface PageProps {
  params: { slug: string }
}

export default async function AnalyticsDashboardPage({ params }: PageProps) {
  const { slug } = params

  const [link, analytics] = await Promise.all([
    prisma.link.findUnique({
      where: { slug },
      select: {
        url: true,
        slug: true,
        createdAt: true,
        expiresAt: true,
      },
    }),
    getLinkAnalytics(slug),
  ])

  if (!link || !analytics) {
    notFound()
  }

  const countriesData = analytics.topCountries.map((c) => ({
    name: c.country,
    count: c.count,
  }))

  const devicesData = analytics.deviceBreakdown.map((d) => ({
    name: d.device,
    count: d.count,
  }))

  const referrersData = analytics.topReferrers.map((r) => ({
    name: r.referrer,
    count: r.count,
  }))

  const topCountry = analytics.topCountries[0]?.country ?? "N/A"
  const topReferrer = analytics.topReferrers[0]?.referrer ?? "Direct"
  const topDevice = analytics.deviceBreakdown[0]?.device ?? "N/A"

  const shortLink = `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← All links
            </a>
          </div>
          <h1 className="text-2xl font-bold text-white">{shortLink}</h1>
          <p className="text-gray-500 text-sm truncate">
            → {truncateUrl(link.url, 80)}
          </p>
          <p className="text-gray-600 text-xs">
            Created {formatDate(link.createdAt)}
            {link.expiresAt && ` · Expires ${formatDate(link.expiresAt)}`}
          </p>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total clicks"
            value={analytics.totalClicks.toLocaleString()}
          />
          <StatCard
            label="Top country"
            value={topCountry}
          />
          <StatCard
            label="Top referrer"
            value={topReferrer}
          />
          <StatCard
            label="Top device"
            value={topDevice}
          />
        </div>

        {/* Clicks over time chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Clicks over time</h2>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </div>
          <ClicksChart data={analytics.clicksByDay} />
        </div>

        {/* Bottom row — countries, devices, referrers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Countries</h2>
            <HorizontalBarChart
              data={countriesData}
              emptyMessage="No country data yet"
            />
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Devices</h2>
            <HorizontalBarChart
              data={devicesData}
              emptyMessage="No device data yet"
            />
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Referrers</h2>
            <HorizontalBarChart
              data={referrersData}
              emptyMessage="No referrer data yet"
            />
          </div>

        </div>

        {/* Footer link */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
          >
            ✂️ Create another link
          </a>
        </div>

      </div>
    </main>
  )
}
