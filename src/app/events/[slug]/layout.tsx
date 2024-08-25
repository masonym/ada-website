// app/events/[slug]/layout.tsx

import EventLayout from "./EventLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <EventLayout>{children}</EventLayout>;
}
