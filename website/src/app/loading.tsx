import { LoadingSpinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <main className="w-full md:px-8">
      <div className="mx-auto mt-20 w-fit">
        <LoadingSpinner />
      </div>
    </main>
  );
}
