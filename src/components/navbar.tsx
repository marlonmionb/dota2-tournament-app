import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { NavbarUserMenu } from "./navbar-user-menu";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <Image src="/draft-arena-logo.png" alt="Draft Arena" width={240} height={60} className="h-16 w-auto" priority />
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/tournaments" className="text-gray-400 hover:text-gray-100 transition-colors">
          Tournaments
        </Link>
        <NavbarUserMenu session={session} />
      </div>
    </nav>
  );
}
