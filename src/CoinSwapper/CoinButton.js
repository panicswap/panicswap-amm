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
      className="flex dark:hover:bg-slate-800 p-2 rounded-md cursor-pointer"
    >
      <img
        src={"/assets/token/" + props.logo + ".svg"}
        className="w-[40px] h-[40px] rounded-full"
      />
      <div className="ml-5">
        <h5 className="text">{coinAbbr}</h5>
        <div className="dark:text-gray-400 text-sm">{coinName}</div>
      </div>
      {/* TODO: Add user balance of the current token */}
    </div>
  );
}
