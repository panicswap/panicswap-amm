export default function WrongNetwork(props) {
  const { open } = props;
  return (
    open && (
      <div className="absolute w-full h-screen top-0 left-0 z-20 flex bg-[#00000055] justify-center items-center pointer-events-none">
        <div className="dark:bg-gray-800 p-5 px-10 rounded-md dark:text-white font-display">
          Unsupported Network: Switch to Fantom Opera
        </div>
      </div>
    )
  );
}
