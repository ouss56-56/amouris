"use client";

import { useI18n } from '@/i18n/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminAnalyticsClientProps {
  revenueStats: { label: string; value: number }[];
  wilayaStats: { label: string; value: number }[];
  topProducts: { name: string; revenue: number }[];
}

const COLORS = ['#0A6B4B', '#C9A84C', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function AdminAnalyticsClient({ revenueStats, wilayaStats, topProducts }: AdminAnalyticsClientProps) {
  const { language } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          {language === 'ar' ? 'التحليلات' : 'Analytiques'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'المبيعات الشهرية' : 'Revenu par Mois'}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: '#f3f4f6'}} 
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [`${v?.toLocaleString() ?? 0} DZD`, 'Revenu']}
                />
                <Bar dataKey="value" fill="#0A6B4B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Wilaya Distribution Chart */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'توزع الطلبات حسب الولاية' : 'Répartition par Wilaya'}</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wilayaStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="label"
                  label={({ name }) => name}
                >
                  {wilayaStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'أفضل المنتجات مبيعاً' : 'Produits les plus vendus'}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border-b last:border-0">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                           {idx + 1}
                        </div>
                        <span className="font-medium">{p.name}</span>
                     </div>
                     <span className="font-bold text-primary">{p.revenue.toLocaleString()} DZD</span>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">Aucune donnée disponible.</p>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
