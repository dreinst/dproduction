"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowRight, ListChecks } from "lucide-react";
import LandingImage from "@/components/LandingImage";
import type { LandingContent } from "@/lib/landing-content";

type Props = { items: LandingContent["masterpieces"]; events: LandingContent["eventList"] };

// Masterpiece = event featured berfoto dari Master Event; di bawahnya daftar semua event aktif per tahun.
export default function MasterpieceSection({ items, events }: Props) {
  const groups = events.reduce<{ label: string; items: Props["events"] }[]>((acc, e) => {
    const label = e.year?.toString() ?? "Lainnya";
    const group = acc.find((g) => g.label === label);
    if (group) group.items.push(e);
    else acc.push({ label, items: [e] });
    return acc;
  }, []);

  return (
    <section id="masterpiece" className="py-20 lg:py-32 bg-white overflow-x-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6"
          >
            <Trophy className="w-4 h-4" /> Portofolio Terbaik
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight"
          >
            Karya <span className="gradient-text">Masterpiece</span> Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Event terbesar yang pernah kami tangani, dari fun run berskala ribuan pelari sampai program multi hari Bank Indonesia.
          </motion.p>
        </div>

        {items.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <motion.article
                key={item.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.08 }}
                className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/60 hover:shadow-xl hover:shadow-slate-300/60 transition-shadow duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-slate-200 overflow-hidden">
                  <LandingImage
                    src={item.photo}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    alt={`Dokumentasi ${item.name}`}
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {item.year != null && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-bold tracking-wider">
                      {item.year}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{item.name}</h3>
                  {item.client && <p className="mt-1 text-sm font-semibold text-blue-700">{item.client}</p>}
                  {item.description && <p className="mt-3 text-slate-600 leading-relaxed">{item.description}</p>}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {groups.length > 0 && (
          <div id="daftar-event" className="mt-24 scroll-mt-24">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6">
                <ListChecks className="w-4 h-4" /> {events.length} Event
              </div>
              <h3 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Event yang Sudah Kami Tangani</h3>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
              {groups.map((group) => (
                <div key={group.label} className="break-inside-avoid mb-8 bg-slate-50 border border-slate-100 rounded-3xl p-6">
                  <h4 className="text-lg font-extrabold text-blue-700 mb-4">{group.label}</h4>
                  <ul className="space-y-3">
                    {group.items.map((e) => (
                      <li key={e.name} className="border-b border-slate-200 last:border-0 pb-3 last:pb-0">
                        <p className="font-semibold text-slate-900 leading-snug">{e.name}</p>
                        {e.client && <p className="text-sm text-slate-600">{e.client}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a href="#galeri" className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300">
            Lihat Galeri Momen <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
