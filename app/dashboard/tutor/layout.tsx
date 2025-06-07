import RequireEmailVerified from "@/components/RequireEmailVerified";

export default function TutorDashboardLayout({
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
