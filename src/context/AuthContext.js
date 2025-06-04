import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import VisaTypeModal from '@/components/VisaTypeModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;

      // Log the user data for debugging
      console.log('Initial user state from localStorage:', parsedUser ?
        `${parsedUser.username} (${parsedUser.role})` : 'No user');

      return parsedUser;
    }
    return null;
  });

  // We'll use the token from the user object directly
  const [loading, setLoading] = useState(true);
  const [showVisaTypeModal, setShowVisaTypeModal] = useState(false);
  const router = useRouter();

  // Save user to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      console.log('AuthContext - Saving user to localStorage:', `${user.username} (${user.role})`);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    // Check if user is logged in
    const checkUserLoggedIn = async () => {
      // Only run on client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      // If we already have a user in state from localStorage, don't validate immediately
      // This prevents unnecessary API calls and potential logout on page navigation
      if (user) {
        console.log('AuthContext - Already have user in state:', `${user.username} (${user.role})`);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/validate', {
          headers: {
            'Cache-Control': 'no-cache',
          },
          credentials: 'include', // Include cookies in the request
        });

        // Handle non-200 responses
        if (!res.ok) {
          // If token validation fails, clear user data
          if (res.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user');
            }
            setUser(null);
          }
          setLoading(false);
          return;
        }

        const data = await res.json();

        if (data.success) {
          // Save user data to localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data.user));
          }

          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        // Don't clear user on network errors
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally omitting user to prevent circular updates

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies in the request
      });

      if (!res.ok) {
        console.error('Login API error:', res.status);
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || `Login failed with status: ${res.status}`
        };
      }

      const data = await res.json();
      console.log('Login response received, success:', data.success);

      if (data.success) {
        // Save user data and token to localStorage for persistence
        if (typeof window !== 'undefined') {
          // Include the token in the user object for API calls
          const userWithToken = {
            ...data.user,
            token: data.token // Store token for API authorization header
          };
          localStorage.setItem('user', JSON.stringify(userWithToken));
          console.log('User data saved to localStorage with token');

          // Also store token separately for easier access
          localStorage.setItem('authToken', data.token);
        }

        // Set user in state (with token)
        setUser({
          ...data.user,
          token: data.token
        });

        // Redirect based on user role
        if (data.user.role === 'admin') {
          console.log('Admin user detected, redirecting to admin dashboard');
          console.log('Admin user data:', data.user);
          router.push('/admin');
        } else if (data.user.role === 'agent') {
          console.log('Agent user detected, redirecting to agent dashboard');
          console.log('Agent user data:', data.user);
          router.push('/agent');
        } else if (data.user.role === 'employee') {
          console.log('Employee user detected, redirecting to employee dashboard');
          console.log('Employee user data:', data.user);
          router.push('/employee');
        } else {
          console.log('Regular user detected');
          console.log('Regular user data:', data.user);

          try {
            // Check if user has preferences in Firebase
            console.log('Checking user preferences in Firebase for user:', data.user.id);
            const preferencesResponse = await fetch(`/api/user/check-preferences?userId=${data.user.id}`, {
              headers: {
                'Cache-Control': 'no-cache',
              }
            });

            const preferencesData = await preferencesResponse.json();
            console.log('User preferences check result:', preferencesData);

            if (preferencesData.success && preferencesData.hasPreferences) {
              console.log('User has preferences in Firebase, redirecting to home');

              // Update localStorage with preferences from Firebase
              if (typeof window !== 'undefined' && preferencesData.preferences) {
                localStorage.setItem('selectedCountry', preferencesData.preferences.selectedCountry);
                localStorage.setItem('selectedCountryName', preferencesData.preferences.selectedCountryName);
                localStorage.setItem('selectedVisaType', preferencesData.preferences.selectedVisaType);
                localStorage.setItem('hasSelectedVisa', 'true');
                console.log('Updated localStorage with preferences from Firebase');
              }

              router.push('/');
            } else {
              // Fallback to localStorage check if Firebase doesn't have preferences
              const hasSelectedVisa = localStorage.getItem('hasSelectedVisa') === 'true';

              if (hasSelectedVisa) {
                console.log('User has visa selection in localStorage, redirecting to home');
                router.push('/');
              } else {
                console.log('User has no preferences, showing visa type modal');
                // Show the modal immediately and don't redirect
                // The modal will handle redirection after selection
                setShowVisaTypeModal(true);
              }
            }
          } catch (error) {
            console.error('Error checking user preferences:', error);

            // Fallback to localStorage check if API call fails
            const hasSelectedVisa = localStorage.getItem('hasSelectedVisa') === 'true';

            if (hasSelectedVisa) {
              console.log('User has visa selection in localStorage, redirecting to home');
              router.push('/');
            } else {
              console.log('User has no preferences, showing visa type modal');
              setShowVisaTypeModal(true);
            }
          }
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (username, email, phoneNumber, password, userType = 'user', additionalData = {}) => {
    try {
      setLoading(true);
      console.log('Attempting registration for:', email, 'as', userType);

      const requestBody = {
        username,
        email,
        phoneNumber,
        password,
        userType,
        ...additionalData
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include', // Include cookies in the request
      });

      if (!res.ok) {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || `Registration failed with status: ${res.status}`
        };
      }

      const data = await res.json();
      console.log('Registration response received, success:', data.success);
      console.log('User data from registration:', data.user);
      console.log('isNewUser flag:', data.user?.isNewUser);

      if (data.success) {
        // Save user data and token to localStorage for persistence
        if (typeof window !== 'undefined') {
          // Include the token in the user object for API calls
          const userWithToken = {
            ...data.user,
            token: data.token // Store token for API authorization header
          };
          localStorage.setItem('user', JSON.stringify(userWithToken));
          console.log('User data saved to localStorage with token');

          // Also store token separately for easier access
          localStorage.setItem('authToken', data.token);
        }

        // Set user in state (with token)
        setUser({
          ...data.user,
          token: data.token
        });

        // Redirect based on user role
        if (data.user.role === 'admin') {
          console.log('Admin user detected, redirecting to admin dashboard');
          router.push('/admin');
        } else if (data.user.role === 'agent') {
          console.log('Agent user detected, redirecting to agent dashboard');
          router.push('/agent');
        } else if (data.user.role === 'employee') {
          console.log('Employee user detected, redirecting to employee dashboard');
          router.push('/employee');
        } else {
          console.log('Regular user detected');

          // For new user registrations, always show the visa type modal
          if (data.user.isNewUser) {
            console.log('New user detected, showing visa type modal');
            // Clear any existing visa selection to ensure they make a fresh choice
            localStorage.removeItem('hasSelectedVisa');
            localStorage.removeItem('selectedCountry');
            localStorage.removeItem('selectedCountryName');
            localStorage.removeItem('selectedVisaType');

            // Show the modal immediately and don't redirect
            // The modal will handle redirection after selection
            setShowVisaTypeModal(true);
            console.log('Modal visibility set to true for new user');
          } else {
            try {
              // Check if user has preferences in Firebase
              console.log('Checking user preferences in Firebase for user:', data.user.id);
              const preferencesResponse = await fetch(`/api/user/check-preferences?userId=${data.user.id}`, {
                headers: {
                  'Cache-Control': 'no-cache',
                }
              });

              const preferencesData = await preferencesResponse.json();
              console.log('User preferences check result:', preferencesData);

              if (preferencesData.success && preferencesData.hasPreferences) {
                console.log('User has preferences in Firebase, redirecting to home');

                // Update localStorage with preferences from Firebase
                if (typeof window !== 'undefined' && preferencesData.preferences) {
                  localStorage.setItem('selectedCountry', preferencesData.preferences.selectedCountry);
                  localStorage.setItem('selectedCountryName', preferencesData.preferences.selectedCountryName);
                  localStorage.setItem('selectedVisaType', preferencesData.preferences.selectedVisaType);
                  localStorage.setItem('hasSelectedVisa', 'true');
                  console.log('Updated localStorage with preferences from Firebase');
                }

                router.push('/');
              } else {
                // Fallback to localStorage check if Firebase doesn't have preferences
                const hasSelectedVisa = localStorage.getItem('hasSelectedVisa') === 'true';

                if (hasSelectedVisa) {
                  console.log('User has visa selection in localStorage, redirecting to home');
                  router.push('/');
                } else {
                  console.log('User has no preferences, showing visa type modal');
                  setShowVisaTypeModal(true);
                }
              }
            } catch (error) {
              console.error('Error checking user preferences:', error);

              // Fallback to localStorage check if API call fails
              const hasSelectedVisa = localStorage.getItem('hasSelectedVisa') === 'true';

              if (hasSelectedVisa) {
                console.log('User has visa selection in localStorage, redirecting to home');
                router.push('/');
              } else {
                console.log('User has no preferences, showing visa type modal');
                setShowVisaTypeModal(true);
              }
            }
          }
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Something went wrong' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      setLoading(true);

      // Even if the API call fails, we want to log the user out on the client side
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Cache-Control': 'no-cache',
          },
          credentials: 'include', // Include cookies in the request
        });

        await res.json();
      } catch (error) {
        console.error('Logout API error:', error);
      }

      // Clear user data from localStorage but preserve visa selection flag
      if (typeof window !== 'undefined') {
        // Save the visa selection flag
        const hasSelectedVisa = localStorage.getItem('hasSelectedVisa');
        const selectedCountry = localStorage.getItem('selectedCountry');
        const selectedCountryName = localStorage.getItem('selectedCountryName');
        const selectedVisaType = localStorage.getItem('selectedVisaType');

        // Clear user data
        localStorage.removeItem('user');

        // Restore visa selection data
        if (hasSelectedVisa) {
          localStorage.setItem('hasSelectedVisa', hasSelectedVisa);
        }
        if (selectedCountry) {
          localStorage.setItem('selectedCountry', selectedCountry);
        }
        if (selectedCountryName) {
          localStorage.setItem('selectedCountryName', selectedCountryName);
        }
        if (selectedVisaType) {
          localStorage.setItem('selectedVisaType', selectedVisaType);
        }
      }

      // Always clear the user state and redirect regardless of API success
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still try to log out locally even if there's an error
      if (typeof window !== 'undefined') {
        // Save the visa selection flag
        const hasSelectedVisa = localStorage.getItem('hasSelectedVisa');
        const selectedCountry = localStorage.getItem('selectedCountry');
        const selectedCountryName = localStorage.getItem('selectedCountryName');
        const selectedVisaType = localStorage.getItem('selectedVisaType');

        // Clear user data
        localStorage.removeItem('user');

        // Restore visa selection data
        if (hasSelectedVisa) {
          localStorage.setItem('hasSelectedVisa', hasSelectedVisa);
        }
        if (selectedCountry) {
          localStorage.setItem('selectedCountry', selectedCountry);
        }
        if (selectedCountryName) {
          localStorage.setItem('selectedCountryName', selectedCountryName);
        }
        if (selectedVisaType) {
          localStorage.setItem('selectedVisaType', selectedVisaType);
        }
      }
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle closing the visa type modal
  const handleCloseVisaTypeModal = () => {
    console.log('Modal closed');
    setShowVisaTypeModal(false);
    // Don't redirect automatically - the modal's handleViewChecklist function will handle redirection
    // This allows the modal to be closed without redirecting if needed
  };

  // Function to update user data (for updating project count, etc.)
  const updateUserData = (newData) => {
    if (!user) return;

    const updatedUser = { ...user, ...newData };

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // Update state
    setUser(updatedUser);
  };

  // Debug log for modal state
  useEffect(() => {
    console.log('AuthContext - showVisaTypeModal state changed:', showVisaTypeModal);
  }, [showVisaTypeModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserData,
        isAuthenticated: !!user,
        showVisaTypeModal, // Expose this state to components
        setShowVisaTypeModal // Allow components to control the modal
      }}
    >
      {children}
      {/* Visa Type Selection Modal */}
      <VisaTypeModal
        isOpen={showVisaTypeModal}
        onClose={handleCloseVisaTypeModal}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
