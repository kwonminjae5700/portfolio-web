import Link from "next/link";
import { BrandFacebook, BrandGithub, BrandLinkedin } from "tabler-icons-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#222] py-12 text-gray-400 text-sm">
      <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 font-bold text-gray-300">
            <Link href="#" className="hover:text-white">
              NAVER Developers
            </Link>
            <Link href="#" className="hover:text-white">
              DEVIEW
            </Link>
            <Link href="#" className="hover:text-white">
              OpenSource
            </Link>
            <Link href="#" className="hover:text-white">
              D2 STARTUP FACTORY
            </Link>
          </div>
          <div className="flex gap-2 text-xs">
            <span>
              Copyright © <strong className="text-gray-300">NAVER Corp.</strong>{" "}
              All Rights Reserved.
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="#"
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <BrandFacebook size={20} color="white" />
          </Link>
          <Link
            href="#"
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <BrandLinkedin size={20} color="white" />
          </Link>
          <Link
            href="#"
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          >
            <BrandGithub size={20} color="white" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
