import { useState } from 'react';
import { authService } from '../services/authService';
import { motion } from 'framer-motion';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    role: 'employee'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
        onAuthSuccess();
      } else {
        if (formData.role === 'employee' && !formData.department) {
          setError('Please select a department');
          setLoading(false);
          return;
        }

        const data = await authService.signup(
          formData.name,
          formData.email,
          formData.password,
          formData.role,
          formData.department || ''
        );

        setPendingMessage(data.message || 'Your account is pending verification.');
        setPendingVerification(true);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-300 text-center"
        >
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Account Pending Verification</h2>
          <p className="text-gray-700 mb-6">{pendingMessage}</p>
          <button
            onClick={() => {
              setPendingVerification(false);
              setIsLogin(true);
              setFormData({
                name: '',
                email: '',
                password: '',
                department: '',
                role: 'employee'
              });
              setError('');
            }}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-blue-300">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to manage grievances' : 'Join our team'}
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {isLogin && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold mb-2">For testing use:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li><strong>Admin ID:</strong> admin123@gmail.com</li>
                <li><strong>Admin Password:</strong> admin123</li>
                <li><strong>Employee ID:</strong> employee123@gmail.com</li>
                <li><strong>Employee Password:</strong> employee123</li>
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {formData.role === 'employee' && (
                  <div>
                    <label className="block text-gray-700 mb-2">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      <option value="Water">Water</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Roads">Roads</option>
                      <option value="Sanitation">Sanitation</option>
                      <option value="Garbage Collection">Garbage Collection</option>
                      <option value="Street Lights">Street Lights</option>
                      <option value="Drainage">Drainage</option>
                      <option value="Public Toilets">Public Toilets</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('');
                setPendingVerification(false);
                setPendingMessage('');
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  department: '',
                  role: 'employee'
                });
              }}
              className="text-blue-600 hover:text-blue-700 transition-colors duration-300 cursor-pointer"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
