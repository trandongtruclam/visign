import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const Promo = () => {
  return (
    <div className="space-y-4 rounded-xl border-2 p-4">
      <div className="space-y-2">
        <div className="flex items-center gap-x-2">
          <Image src="/unlimited.svg" alt="Pro" height={26} width={26} />

          <h3 className="text-lg font-bold">Support the Project</h3>
        </div>

        <p className="text-muted-foreground">Help us keep this platform free for everyone!</p>
      </div>

      <Button variant="super" className="w-full" size="lg" asChild>
        <Link href="/shop">Learn more</Link>
      </Button>
    </div>
  );
};
