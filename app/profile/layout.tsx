import RequireEmailVerified from "@/components/RequireEmailVerified";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireEmailVerified>{children}</RequireEmailVerified>;
}
