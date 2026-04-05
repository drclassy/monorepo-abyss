export function FeatureCards() {
  const features = [
    {
      title: "Otomatisasi",
      description: "CTE V2 secara otomatis menyuntikkan petunjuk berbasis tugas ke dalam prompt Anda — role definition, Chain-of-Thought hints, dan output format — disesuaikan dengan model Artificial Intelligence yang dipilih: Claude 4, GPT-5, Gemini 3, dan lainnya.",
      highlighted: true,
    },
    {
      title: "Strukturisasi SuperPrompt",
      description: "Setiap output diorganisasi dalam blok modular terstruktur: Role, Context, Task, Constraints, dan Output Format. Menghasilkan prompt yang optimal dan konsisten di seluruh model Artificial Intelligence generasi terbaru.",
      highlighted: false,
    },
    {
      title: "Rekayasa Konteks",
      description: "Arsitektur konteks berlapis memastikan model Artificial Intelligence memahami intent, audience, dan tone dengan tepat. Hasilkan output yang dapat diprediksi, andal, dan berkualitas tinggi di setiap request.",
      highlighted: false,
    },
  ]

  return (
    <section className="border-t border-[#e0dedb] border-b border-[#e0dedb]">
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`p-6 flex flex-col gap-2 ${
                // Updated feature card borders to 1px
                feature.highlighted ? "bg-white border border-[#e0dedb] shadow-sm" : "border border-[#e0dedb]/80"
              }`}
            >
              {feature.highlighted && (
                <div className="space-y-1 mb-2">
                  <div className="w-full h-0.5 bg-[#322d2b]/8"></div>
                  <div className="w-32 h-0.5 bg-[#322d2b]"></div>
                </div>
              )}
              <h3 className="text-[#49423d] text-sm font-semibold leading-6">{feature.title}</h3>
              <p className="text-[#605a57] text-sm leading-[22px] whitespace-pre-line">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
