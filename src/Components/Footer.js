import { SiGitbook, SiMedium } from "react-icons/si";
import { RiGovernmentFill } from "react-icons/ri";
import { GoBook } from "react-icons/go";
import {
  FaTelegramPlane,
  FaDiscord,
  FaTwitter,
  FaGithub,
  FaBookOpen,
  FaVoteYea,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-5 p-3">
      <div className="mt-3 flex justify-between mx-2 text-xl mb-2">
        <div className="flex dark:text-gray-600 text-sm">
          <a
            className="flex items-center border-0 px-3 hover:no-underline dark:hover:text-white"
            href="/docs"
          >
            Documentation
          </a>
          <a
            className="flex items-center border-0 px-3 hover:no-underline dark:hover:text-white"
            href="/gov"
          >
            Governance
          </a>
        </div>
        <div className="flex">
          <SocialItem
            name="Medium"
            link="https://medium.com/@thepanicswap/"
            icon={<SiMedium />}
            className="dark:text-white"
          />
          <SocialItem
            name="Telegram"
            link="https://t.me/panic_swap"
            icon={<FaTelegramPlane />}
            className="dark:text-white"
          />
          <SocialItem
            name="Discord"
            link="https://discord.gg/xNpFVYxQcZ"
            icon={<FaDiscord />}
            className="dark:text-white"
          />
          <SocialItem
            name="Twitter"
            link="https://twitter.com/panic_swap"
            icon={<FaTwitter />}
            className="dark:text-white"
          />
          <SocialItem
            name="GitHub"
            link="https://github.com/panicswap"
            icon={<FaGithub />}
            className="dark:text-white"
          />
        </div>
      </div>
    </footer>
  );
}

const SocialItem = ({ name, link, icon, className }) => {
  return (
    <a
      className="flex items-center border-0 px-3 hover:no-underline"
      href={link}
    >
      <div className={className}>{icon}</div>
    </a>
  );
};
