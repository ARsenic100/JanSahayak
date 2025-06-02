const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup controller
const signup = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be either admin or employee' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role,
      isVerified: false // New users are unverified by default
    };

    // Only add department if role is employee
    if (role === 'employee') {
      if (!department) {
        return res.status(400).json({ error: 'Department is required for employees' });
      }
      userData.department = department;
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: 'Account created successfully. Please wait for admin verification.',
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Your account is pending verification. Please wait for admin approval.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, id: user._id, role: user.role, department: user.department });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify user (admin only)
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: 'User verified successfully', email: user.email });
  } catch (error) {
    console.error('Error in verifyUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove user (admin only)
const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent removing the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot remove the last admin user' });
      }
    }

    await user.deleteOne();

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error in removeUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate role
    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be either admin or employee' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role,
      isVerified: true // Admin-created users are verified by default
    };

    // Only add department if role is employee
    if (role === 'employee') {
      if (!department) {
        return res.status(400).json({ error: 'Department is required for employees' });
      }
      userData.department = department;
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    res.status(201).json({ 
      message: 'User created successfully',
      email: user.email,
      role: user.role,
      department: user.department
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all employees (excluding admins)
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password') // Exclude password from the response
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees' });
  }
};

// Get employee by ID (admin only)
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await User.findOne({ _id: id, role: 'employee' })
      .select('-password'); // Exclude password from the response

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid employee ID' });
    }
    res.status(500).json({ message: 'Error fetching employee' });
  }
};

// Search employees
const searchEmployees = async (req, res) => {
  try {
    const { 
      email, 
      department, 
      isVerified,
      startDate,
      endDate
    } = req.query;

    // Build search query
    const query = { role: 'employee' };

    // Add email search (case-insensitive partial match)
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    // Add department filter
    if (department) {
      query.department = department;
    }

    // Add verification status filter
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Execute search
    const employees = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    console.error('Error searching employees:', error);
    res.status(500).json({ message: 'Error searching employees' });
  }
};

// Get my profile (authenticated employee)
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update password (authenticated user)
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

module.exports = {
  signup,
  login,
  getAllUsers,
  verifyUser,
  removeUser,
  createUser,
  getAllEmployees,
  getEmployeeById,
  searchEmployees,
  getMyProfile,
  updatePassword
}; 