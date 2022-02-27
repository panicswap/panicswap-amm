import { SiMedium } from "react-icons/si";
import {
  FaTelegramPlane,
  FaDiscord,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-5 p-3">
      <h5 className="text-lg text-center">PanicSwap 💙</h5>
      <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mt-3">
        <a
          className="text-center rounded-md border border-gray-300 p-2 hover:no-underline"
          href="https://ftmscan.com/address/0x41abb76d39c4dcd885340f9b98c26b51250644cc"
        >
          MasterChef Contract
        </a>
        <a
          className="text-center rounded-md border border-gray-300 p-2 hover:no-underline"
          href="https://ftmscan.com/address/0xa341d77315e5e130ad386e034b4c9714cb149f4a"
        >
          Spookyswap PANIC-WFTM
        </a>
        <a
          className="text-center rounded-md border border-gray-300 p-2 hover:no-underline"
          href="https://classic.panicswap.com/"
        >
          Pre-Farm
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 justify-between mx-auto max-w-2xl">
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
      </div>
    </footer>
  );
}

const SocialItem = ({ name, link, icon, color }) => {
  return (
    <a
      className="flex items-center border-2 p-2 px-3 rounded-md hover:border-blue-300 focus:border-blue-300 hover:no-underline"
      href={link}
    >
      <div style={{ color: color }}>{icon}</div>
      <div className="ml-2">{name}</div>
    </a>
  );
};
