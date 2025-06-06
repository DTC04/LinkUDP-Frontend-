import RequireEmailVerified from "@/components/RequireEmailVerified";

export default function TutoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireEmailVerified>{children}</RequireEmailVerified>;
}
