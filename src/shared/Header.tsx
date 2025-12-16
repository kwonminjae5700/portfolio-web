import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

const Header = () => {
  return (
    <header className="w-full h-21 px-98 flex justify-between items-center fixed top-0 bg-white z-50 border-b border-gray-300">
      <div className="flex space-x-20 items-center">
        <div className="text-3xl">Kwon5700</div>
        <nav>
          <ul className="flex space-x-6 text-xl text-gray-400">
            <li>
              <Link href="/portfolio" className="hover:underline">
                Portfolio
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex items-cente gap-4">
        <div className="border-[#d8d8d8] border-[1.3px] rounded-xs">
          <input
            className="px-4 py-2 w-78 focus:outline-none"
            placeholder="검색어를 입력하세요.."
            type="text"
          />
        </div>
        <button className="border-[#e0e0e0] border-l-[1.5px] pl-4">
          <IconSearch size={28} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default Header;
