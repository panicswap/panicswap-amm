import { formatNumber } from "../helpers/numberFormatter";

const HeaderStats = ({ totalTvl, panicPrice, divApr }) => {
  return (
    <section className="p-3 flex max-w-3xl">
      <HeaderItem label="TVL" value={"$" + formatNumber(totalTvl / 1e18, 2)} />
      <HeaderItem
        label="$PANIC"
        value={"$" + formatNumber(panicPrice / 1e18, 3)}
      />
      <HeaderItem
        label="yvWFTM Dividends"
        value={formatNumber(divApr / 100, 2) + "%"}
      />
    </section>
  );
};

export default HeaderStats;

const HeaderItem = ({ label, value }) => {
  return (
    <div className="ml-2 py-1 lg:ml-4 rounded-lg bg-blue-500 dark:bg-gray-800 flex items-center pr-1">
      <div className="text-xs text-bold text-lightGray dark:text-gray-400 leading-none p-1 rounded-md m-1">
        {label}
      </div>
      <div className="text-white dark:text-blue-200 font-heading">{value}</div>
    </div>
  );
};
