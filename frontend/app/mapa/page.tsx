import { PublicLayout } from "@/components/layout/PublicLayout";
import { PanamaValueChainMap } from "@/components/mapa-cadena-valor";

export default function MapaCadenaValorPage() {
  return (
    <PublicLayout>
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-[20px] md:px-[40px] py-[40px]">
        <PanamaValueChainMap />
      </main>
    </PublicLayout>
  );
}
