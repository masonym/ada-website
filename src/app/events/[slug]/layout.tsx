// app/events/[slug]/layout.tsx

import EventLayout from "@/app/components/EventLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EventLayout>{children}</EventLayout>;
}
