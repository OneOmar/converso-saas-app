'use client';

import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useEffect, useState} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {subjects} from "@/constants";

const SubjectFilter = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    // Update or remove subject param
    if (selectedSubject !== 'all') {
      params.set('subject', selectedSubject);
    } else {
      params.delete('subject');
    }

    // Update URL
    router.replace(`${pathname}?${params.toString()}`);
  }, [selectedSubject, pathname, router, searchParams]);

  return (
    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a subject"/>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Subjects</SelectLabel>
          <SelectItem value="all" className="capitalize">
            All subjects
          </SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject} value={subject} className="capitalize">
              {subject}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SubjectFilter;