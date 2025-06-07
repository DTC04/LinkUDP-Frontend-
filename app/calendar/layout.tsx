import RequireEmailVerified from "@/components/RequireEmailVerified";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireEmailVerified>{children}</RequireEmailVerified>;
}
