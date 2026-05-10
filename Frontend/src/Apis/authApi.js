const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return response.json();
};

export const getMe = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/get-user`, {
            method: 'GET',
            // Fix: Combine headers into a single object
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Fix: Manually throw an error for 401s and other bad statuses
        if (!response.ok) {
            const error = new Error("Request failed");
            error.status = response.status; // Attach the 401 status so tokenExpired can see it
            throw error;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; // Re-throw so tokenExpired catches it
    }
};