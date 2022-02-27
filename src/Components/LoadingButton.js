import { CircularProgress } from "@material-ui/core";

export default function LoadingButton(props) {
  const { children, loading, valid, success, fail, onClick, ...other } = props;
  return (
    <div>
      <button
        className="p-3 bg-blue-500 w-full rounded-xl hover:bg-blue-400 cursor-pointer  text-white font-bold transition-colors"
        disabled={loading || !valid}
        type="submit"
        onClick={onClick}
        {...other}
      >
        {children}
      </button>
      {loading && <CircularProgress size={24} />}
    </div>
  );
}
