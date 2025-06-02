import logo from '/assets/logo.png';

const PageLoader = () => {
  return (
    <div className="flex justify-center items-center bg-white max-w-screen h-screen">
      <div
        className={`border-8 border-blue flex justify-center items-center text-black animate-ping rounded-full w-16 h-16`}
      ><img src={logo} alt="logo" /></div>
    </div>
  );
};

export default PageLoader;