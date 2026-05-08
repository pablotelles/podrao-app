export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-350 px-8 py-6"
      style={{ marginTop: 'var(--topbar-height)' }}
    >
      {children}
    </div>
  );
}
