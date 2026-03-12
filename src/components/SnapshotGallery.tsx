import { Camera, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import snapshot3 from '../../3.jpeg';
import snapshot4 from '../../4.jpeg';
import snapshot33 from '../../33.jpeg';
import snapshot77 from '../../77.jpeg';
import snapshot89 from '../../89.jpeg';
import snapshot99 from '../../99.jpeg';

const snapshots = [
  { src: snapshot3, label: 'Snapshot 3' },
  { src: snapshot4, label: 'Snapshot 4' },
  { src: snapshot33, label: 'Snapshot 33' },
  { src: snapshot77, label: 'Snapshot 77' },
  { src: snapshot89, label: 'Snapshot 89' },
  { src: snapshot99, label: 'Snapshot 99' },
];

export default function SnapshotGallery() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
              <Camera size={18} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Project Snapshots</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Updated visual gallery using the latest JPEG exports
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-900">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-amber-600" />
            <p>
              These six images are bundled into the site so they render in production without relying on root-level static paths.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {snapshots.map((snapshot) => (
              <figure
                key={snapshot.label}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={snapshot.src}
                    alt={snapshot.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="flex items-center justify-between px-5 py-4">
                  <span className="text-sm font-semibold text-slate-800">{snapshot.label}</span>
                  <span className="text-xs uppercase tracking-[0.24em] text-slate-400">JPEG</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}