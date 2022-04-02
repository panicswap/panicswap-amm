import { CircularProgress } from "@material-ui/core";

export default function LoadingButton(props) {
  const { children, loading, valid, success, fail, onClick, ...other } = props;
  return (
    <div>
      <button
        className="p-3 bg-blue-500 hover:bg-blue-600 w-full rounded-xl dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white cursor-pointer text-white font-bold transition-colors"
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
