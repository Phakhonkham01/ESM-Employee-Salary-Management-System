const API_URL ='http://localhost:8000/api';

export interface DepartmentData {
    _id: string;
    department_name: string;
    created_at?: string;
}

export interface PositionData {
    _id: string;
    department_id: string;
    position_name: string;
    created_at?: string;
    department_name?: string; // สำหรับ populate
}

// Departments API
export const getAllDepartments = async (): Promise<{ departments: DepartmentData[] }> => {
    try {
        const response = await fetch(`${API_URL}/departments`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const departments = await response.json();
        return { departments };
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

export const createDepartment = async (data: { department_name: string }) => {
    try {
        const response = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create department');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating department:', error);
        throw error;
    }
};

// Positions API
export const getAllPositions = async (): Promise<{ positions: PositionData[] }> => {
    try {
        const response = await fetch(`${API_URL}/positions`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const positions = await response.json();
        return { positions };
    } catch (error) {
        console.error('Error fetching positions:', error);
        throw error;
    }
};

export const createPosition = async (data: { department_id: string; position_name: string }) => {
    try {
        const response = await fetch(`${API_URL}/positions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create position');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating position:', error);
        throw error;
    }
};

export const getPositionsByDepartment = async (departmentId: string): Promise<{ positions: PositionData[] }> => {
    try {
        const response = await fetch(`${API_URL}/positions/department/${departmentId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const positions = await response.json();
        return { positions };
    } catch (error) {
        console.error('Error fetching positions by department:', error);
        throw error;
    }
};