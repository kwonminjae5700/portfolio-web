import Image from "next/image";

export default function Page() {
  return (
    <main>
      <Image
        src="/background.png"
        alt="Kwon5700 Profile Picture"
        width={1920}
        height={150}
        className="w-full h-auto"
      />
    </main>
  );
}
