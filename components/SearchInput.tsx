'use client';

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import Image from "next/image";

const SearchInput = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('topic') || '');

  useEffect(() => {
    // Debounce search to avoid excessive updates
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      // Update or remove the topic param
      if (searchQuery) {
        params.set('topic', searchQuery);
      } else {
        params.delete('topic');
      }

      // Update URL with new params
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  return (
    <div className="relative border border-black rounded-lg items-center flex gap-2 px-2 py-1 h-fit">
      <Image src="/icons/search.svg" alt="search" width={15} height={15}/>
      <input
        type="text"
        placeholder="Search companions..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
};

export default SearchInput;