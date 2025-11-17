import Image from "next/image"

export function DashboardPreview() {
  return (
    <div
      className="
        hidden min-[480px]:block
        w-[calc(100vw-2rem)]             /* base: full-ish width with padding room */
        max-w-[480px]                    /* ≥480px */
        sm:max-w-[600px]                 /* ≥640px */
        md:max-w-[780px]                 /* ≥768px */
        lg:max-w-[960px]                 /* ≥1024px */
        xl:max-w-[1080px]                /* ≥1280px */
        2xl:max-w-[1180px]               /* ≥1536px */
        min-[1380px]:max-w-[1080px]
        min-[1450px]:max-w-[1180px]              
        min-[1600px]:max-w-[1280px]
        min-[1700px]:max-w-[1480px]
        mx-auto
      "
    >
      <div className="bg-primary-light/50 rounded-2xl p-2 shadow-2xl">
        <Image
          src="/images/image.png"
          alt="Dashboard preview"
          width={1360}
          height={800}
          className="w-full h-auto object-cover rounded-xl shadow-lg"
        />
      </div>
    </div>
  )
}