import RequireEmailVerified from "@/components/RequireEmailVerified";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireEmailVerified>
      {children}
    </RequireEmailVerified>
  );
}
