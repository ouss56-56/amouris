import Link from 'next/link';
import { Pipette, FlaskConical, Sparkles } from 'lucide-react';

export function ShopCards({ parfumsCount, flaconsCount, accessoiresCount }: { parfumsCount: number, flaconsCount: number, accessoiresCount: number }) {
  const cards = [
    { title: 'Parfums', count: parfumsCount, href: '/shop?type=perfume', icon: Sparkles, color: 'bg-emerald-50 text-emerald-900 border-emerald-100' },
    { title: 'Flacons', count: flaconsCount, href: '/shop?type=flacon', icon: FlaskConical, color: 'bg-amber-50 text-amber-900 border-amber-100' },
    { title: 'Accessoires', count: accessoiresCount, href: '/shop?type=accessory', icon: Pipette, color: 'bg-rose-50 text-rose-900 border-rose-100' },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(c => (
          <Link key={c.title} href={c.href} className={`flex items-center gap-6 p-8 rounded-3xl border ${c.color} hover:scale-[1.02] transition-transform`}>
            <div className={`w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
              <c.icon size={28} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold">{c.title}</h3>
              <p className="font-sans text-sm font-medium mt-1 opacity-70">{c.count} produits disponibles</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
