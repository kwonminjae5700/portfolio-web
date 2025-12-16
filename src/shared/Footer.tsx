import { EXTERNAL_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="w-full h-40 py-10 px-78 border-t bg-gray-100 border-gray-300 flex items-baseline justify-between">
      <div className="flex-col">
        <div className="font-semibold mb-2">Contact Me</div>
        <div className="flex-col gap-0.5">
          <div>이메일: me@kwon5700.kr</div>
        </div>
      </div>
      <div className="flex-col items-end">
        <div className="font-semibold mb-2">Kwon5700&apos;s Link</div>
        <div className="flex-col gap-0.5 items-end">
          <a href={EXTERNAL_LINKS.PORTFOLIO}>포트폴리오 바로가기</a>
          <a href={EXTERNAL_LINKS.GITHUB}>깃허브 바로가기</a>
        </div>
      </div>
    </footer>
  );
}
