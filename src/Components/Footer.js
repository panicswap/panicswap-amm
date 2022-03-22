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
    <footer className="mt-5 p-3 flex justify-center">
      <div className="mt-3 flex flex-none justify-center mx-2 max-w-xl text-xl mb-2">
        <SocialItem
          name="Medium"
          link="https://medium.com/@thepanicswap/"
          icon={<SiMedium />}
          color="#000"
        />
        <SocialItem
          name="Telegram"
          link="https://t.me/panic_swap"
          icon={<FaTelegramPlane />}
          color="#0088cc"
        />
        <SocialItem
          name="Discord"
          link="https://discord.gg/xNpFVYxQcZ"
          icon={<FaDiscord />}
          color="#7289da"
        />

        <SocialItem
          name="Twitter"
          link="https://twitter.com/panic_swap"
          icon={<FaTwitter />}
          color="#1da1f2"
        />
        <SocialItem
          name="GitHub"
          link="https://github.com/panicswap"
          icon={<FaGithub />}
        />
        <SocialItem
          name="Documentation"
          link="/docs"
          icon={<SiGitbook />}
          color="#4285fd"
        />

        <SocialItem name="Governance" link="/gov" icon={<RiGovernmentFill />} />
      </div>
    </footer>
  );
}

const SocialItem = ({ name, link, icon, color }) => {
  return (
    {
      /* TODO - resize icons */
    },
    (
      <a
        className="flex items-center border-0 px-3 hover:no-underline"
        href={link}
      >
        <div style={{ color: color }}>{icon}</div>
      </a>
    )
  );
};
