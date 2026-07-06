import { IconBrandGithub, IconWorld, IconMail } from "@tabler/icons-react";
import { CONTAINER, EXTERNAL_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const footerLink =
  "inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-sm";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div
        className={cn(
          CONTAINER,
          "py-10 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="flex flex-col gap-2">
          <div className="text-lg font-black tracking-tight text-ink">
            Kwon<span className="text-accent">5700</span>
          </div>
          <p className="text-sm text-muted">권민재의 개발 기록</p>
          <p className="text-xs text-faint mt-2">
            © {new Date().getFullYear()} Kwon Minjae
          </p>
        </div>
        <nav aria-label="외부 링크">
          <ul className="flex flex-col gap-2.5 sm:items-end">
            <li>
              <a
                href={EXTERNAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLink}
              >
                <IconBrandGithub size={16} />
                GitHub
              </a>
            </li>
            <li>
              <a
                href={EXTERNAL_LINKS.PORTFOLIO}
                target="_blank"
                rel="noopener noreferrer"
                className={footerLink}
              >
                <IconWorld size={16} />
                Portfolio
              </a>
            </li>
            <li>
              <a href="mailto:me@kwon5700.kr" className={footerLink}>
                <IconMail size={16} />
                me@kwon5700.kr
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
