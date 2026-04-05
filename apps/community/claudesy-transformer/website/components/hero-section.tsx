import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative pt-[216px] pb-16">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex flex-col items-center gap-12">
          {/* Hero Content */}
          <div className="max-w-[937px] flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-6">
              <h1 className="max-w-[748px] text-center text-[#37322f] text-5xl md:text-[80px] font-normal leading-tight md:leading-[96px] font-serif">
                Ubah Prompt Mentah Menjadi SuperPrompt
              </h1>
              <p className="max-w-[506px] text-center text-[#37322f]/80 text-lg font-medium leading-7">
                Claudesy Transformer Prompt Engine 2 (CTE2) mengoptimalkan instruksi Anda untuk 7 model Artificial Intelligence terkemuka — OpenAI, Anthropic, Gemini, dan lainnya — dengan 5 mode transformasi, rekayasa konteks cerdas, dan injeksi strategi otomatis.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3 justify-center">
            <Button className="h-10 px-12 bg-[#37322f] hover:bg-[#37322f]/90 text-white rounded-full font-medium text-sm shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset]" asChild>
              <Link href="/register">Coba Sekarang — Gratis</Link>
            </Button>
            <Button variant="ghost" className="h-10 px-6 text-[#37322f] hover:bg-[#37322f]/5 rounded-full font-medium text-sm">
              Lihat Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
