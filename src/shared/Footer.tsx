import { EXTERNAL_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="w-full h-auto sm:h-40 py-8 sm:py-10 px-6 sm:px-12 md:px-24 lg:px-48 xl:px-78 border-t bg-gray-100 border-gray-300 flex flex-col gap-6 sm:flex-row sm:gap-0 sm:items-baseline sm:justify-between transition-all duration-300">
      <div className="flex flex-col">
        <div className="font-semibold mb-2">Contact Me</div>
        <div className="flex flex-col gap-0.5">
          <div>이메일: me@kwon5700.kr</div>
        </div>
      </div>
      <div className="flex flex-col sm:items-end">
        <div className="font-semibold mb-2">Kwon5700&apos;s Link</div>
        <div className="flex flex-col gap-0.5 sm:items-end">
          <a href={EXTERNAL_LINKS.PORTFOLIO} target="_blank">
            포트폴리오 바로가기
          </a>
          <a href={EXTERNAL_LINKS.GITHUB} target="_blank">
            깃허브 바로가기
          </a>
        </div>
      </div>
    </footer>
  );
}
