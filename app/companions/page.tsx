import {getAllCompanions} from "@/lib/actions/companion.actions";
import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import {getSubjectColor} from "@/lib/utils";

const CompanionLibrary = async ({searchParams}: SearchParams) => {
  // Extract and normalize filters
  const filters = await searchParams;
  const subject = filters.subject || "";
  const topic = filters.topic || "";

  // Fetch companions with filters
  const companions = await getAllCompanions({subject, topic});

  return (
    <main>
      {/* Header with search */}
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1 className="text-3xl font-bold">Companion Library</h1>
        <SearchInput/>
      </section>

      {/* Companion grid */}
      <section className="companions-grid">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>
    </main>
  );
};

export default CompanionLibrary;