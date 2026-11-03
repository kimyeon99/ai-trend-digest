import { notFound } from "next/navigation";

import { Modal } from "@/components/Modal";
import { PaperDetail } from "@/components/PaperDetail";
import { getPaper, listPaperParams } from "@/lib/issues";

export async function generateStaticParams() {
  return listPaperParams();
}

// Intercepts a card click so the paper opens over the issue instead of replacing it
export default async function PaperModal({ params }: PageProps<"/weeks/[week]/[paper]">) {
  const { week, paper: slug } = await params;
  const found = await getPaper(week, slug);
  if (!found) notFound();

  return (
    <Modal>
      <PaperDetail paper={found.paper} rank={found.rank} />
    </Modal>
  );
}
