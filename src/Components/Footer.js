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
      <div className="mt-3 flex justify-between mx-2 text-xl mb-2 flex-col items-center md:flex-row">
        <div className="flex text-gray-500 dark:text-gray-600 text-sm">
          <a
            className="flex items-center border-0 px-2 text-md hover:no-underline hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300"
            href="https://panic-swap.gitbook.io/panicswap/"
            target="_blank"
          >
            Docs
          </a>
          <a
            className="flex items-center border-0 px-2 text-md hover:no-underline hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-300"
            href="https://snapshot.org/#/panicswap.eth/"
            target="_blank"
          >
            Governance
          </a>
        </div>
        <div className="flex text-gray-500 dark:text-gray-300 mt-5">
          <SocialItem
            name="Medium"
            link="https://medium.com/@thepanicswap/"
            icon={<SiMedium />}
            className="hover:text-blue-500 dark:hover:text-blue-300"
          />
          <SocialItem
            name="Telegram"
            link="https://t.me/panic_swap"
            icon={<FaTelegramPlane />}
            className="hover:text-blue-500 dark:hover:text-blue-300"
          />
          <SocialItem
            name="Discord"
            link="https://discord.gg/xNpFVYxQcZ"
            icon={<FaDiscord />}
            className="hover:text-blue-500 dark:hover:text-blue-300"
          />
          <SocialItem
            name="Twitter"
            link="https://twitter.com/panic_swap"
            icon={<FaTwitter />}
            className="hover:text-blue-500 dark:hover:text-blue-300"
          />
          <SocialItem
            name="GitHub"
            link="https://github.com/panicswap"
            icon={<FaGithub />}
            className="hover:text-blue-500 dark:hover:text-blue-300"
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
      target="_blank"
    >
      <div className={className}>{icon}</div>
    </a>
  );
};
