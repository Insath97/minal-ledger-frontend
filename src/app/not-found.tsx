import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-emerald-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="mt-2 text-slate-500">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
