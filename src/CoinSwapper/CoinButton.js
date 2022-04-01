import PropTypes from "prop-types";

CoinButton.propTypes = {
  coinName: PropTypes.string.isRequired,
  coinAbbr: PropTypes.string.isRequired,
  coinAddress: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function CoinButton(props) {
  const { coinName, coinAbbr, coinAddress, onClick, ...other } = props;

  return (
    <div
      onClick={onClick}
      className="flex dark:hover:bg-slate-800 p-3 rounded-md cursor-pointer"
    >
      <img src={"/assets/token/" + props.logo + ".svg"} className="w-[45px]" />
      <div className="ml-5">
        <h5 className="text-xl">{coinAbbr}</h5>
        <div className="dark:text-gray-400">{coinName}</div>
      </div>
      {/* TODO: Add user balance of the current token */}
    </div>
  );
}
