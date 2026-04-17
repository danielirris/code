"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [term, setTerm] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
          params.set("q", term);
        } else {
          params.delete("q");
        }
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [term, pathname, router, searchParams]);

  return (
    <div style={{ position: "relative", width: "300px", opacity: isPending ? 0.7 : 1 }}>
      <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="input-base" 
        style={{ paddingLeft: "2.8rem", borderRadius: "100px" }} 
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
    </div>
  );
}
