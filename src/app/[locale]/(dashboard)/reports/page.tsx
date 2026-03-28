"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import AppHeader from "@/components/layout/header";
import ReportsDashboard from "@/components/reports/reports-dashboard";

export default function ReportsPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <ReportsDashboard date={date} setDate={setDate} />
      </main>
    </>
  );
}
