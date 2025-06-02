const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">Sorry, the page you are looking for doesn't exist.</p>
      <a
        href="/"
        className="text-blue-600 hover:underline text-lg font-medium"
      >
        Go back to Home
      </a>
    </div>
  );
};

export default NotFound;
