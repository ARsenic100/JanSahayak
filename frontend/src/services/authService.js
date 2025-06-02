import api from '../api/axiosInstance';

export const authService = {
  async signup(name, email, password, role, department) {
    try {
      const response = await api.post('/auth/signup', { name, email, password, role, department });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Signup failed';
      throw new Error(message);
    }
  },

  // Alias for signup to maintain backward compatibility
  async register(name, email, password, role, department) {
    return this.signup(name, email, password, role, department);
  },

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, id, role: userRole, department: userDepartment } = response.data;

      localStorage.setItem('id', id);
      localStorage.setItem('email', email);
      localStorage.setItem('token', token);
      localStorage.setItem('role', userRole);
      if (userDepartment) {
        localStorage.setItem('department', userDepartment);
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  },

  async getAllUsers() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('getAllUsers error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to fetch users';
      throw new Error(message);
    }
  },

  async getAllEmployees() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/auth/employees', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('getAllEmployees error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to fetch users';
      throw new Error(message);
    }
  },

  async getEmployeeById(id) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get(`/auth/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('getEmployeeById error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to fetch employee details';
      throw new Error(message);
    }
  },

  async getMyProfile() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('getMyProfile error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to fetch profile';
      throw new Error(message);
    }
  },

  async updatePassword(currentPassword, newPassword) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.put('/auth/profile/password', 
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('updatePassword error:', error.response || error);
      const message = error.response?.data?.message || error.message || 'Failed to update password';
      throw new Error(message);
    }
  },

  async verifyUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post(`/auth/verify-user/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('verifyUser error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to verify user';
      throw new Error(message);
    }
  },

  async removeUser(userId) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.delete(`/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('removeUser error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to remove user';
      throw new Error(message);
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('department');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getRole() {
    return localStorage.getItem('role');
  },

  getDepartment() {
    return localStorage.getItem('department');
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  async createUser(userData) {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.post('/auth/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('createUser error:', error.response || error);
      const message = error.response?.data?.error || error.message || 'Failed to create user';
      throw new Error(message);
    }
  },
};
