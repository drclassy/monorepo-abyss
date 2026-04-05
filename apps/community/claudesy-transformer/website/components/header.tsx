import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="w-full border-b border-[#37322f]/6 bg-[#f7f5f3]">
      <div className="max-w-[1060px] mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div className="text-[#37322f] font-semibold text-lg">Claudesy CTE2</div>
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Cara Kerja</button>
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Fitur</button>
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Harga</button>
              <button className="text-[#37322f] hover:text-[#37322f]/80 text-sm font-medium">Dokumentasi</button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" className="text-[#37322f] hover:bg-[#37322f]/5" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button className="bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full text-sm px-5" asChild>
              <Link href="/register">Mulai Gratis</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
