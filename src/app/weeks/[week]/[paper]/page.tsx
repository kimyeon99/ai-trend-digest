import Link from "next/link";
import { notFound } from "next/navigation";

import { PaperDetail } from "@/components/PaperDetail";
import { getPaper, listPaperParams } from "@/lib/issues";

export async function generateStaticParams() {
  return listPaperParams();
}

// Opened from a shared link or a refresh; a click on a card shows app/@modal instead
export default async function PaperPage({ params }: PageProps<"/weeks/[week]/[paper]">) {
  const { week, paper: slug } = await params;
  const found = await getPaper(week, slug);
  if (!found) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <Link href={`/weeks/${week}`} className="text-sm underline">
        ← {week} 호
      </Link>
      <PaperDetail paper={found.paper} rank={found.rank} />
    </main>
  );
}
