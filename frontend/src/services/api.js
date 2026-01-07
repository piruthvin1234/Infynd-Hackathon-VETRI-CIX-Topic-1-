import axios from 'axios';

export const API_URL = 'http://localhost:8000';

export const processWebsite = async (input) => {
    try {
        const formData = new FormData();
        if (input instanceof File) {
            formData.append('file', input);
        } else if (input.startsWith('http') || input.includes('.')) {
            // Basic check for URL vs Path. If it looks like a url, send as url.
            // Note: Paths can also have dots, but for now we assume if it's not a file object
            // and the user is in "Single Site" mode, they might be pasting a URL.
            // Ideally the UI should differentiate.
            // Let's rely on the UI passing a specific key or structure, but here we keep it simple.
            // If the input is a string and starts with http, use 'url'.
            if (input.startsWith('http') || input.startsWith('www')) {
                formData.append('url', input);
            } else {
                formData.append('directory_path', input);
            }
        } else {
            formData.append('directory_path', input);
        }

        const response = await axios.post(`${API_URL}/process`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const processBulkFile = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API_URL}/process/bulk`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Bulk Process Error:", error);
        throw error;
    }
}

export const startBatch = async (directoryPath) => {
    try {
        const response = await axios.post(`${API_URL}/batch/start`, { directory_path: directoryPath });
        return response.data;
    } catch (error) {
        console.error("Batch Start Error:", error);
        throw error;
    }
};

export const getBatchStatus = async () => {
    try {
        const response = await axios.get(`${API_URL}/batch/status`);
        return response.data;
    } catch (error) {
        console.error("Batch Status Error:", error);
        throw error;
    }
};

export const getCompanies = async () => {
    try {
        const response = await axios.get(`${API_URL}/companies`);
        return response.data;
    } catch (error) {
        console.error("List Companies Error:", error);
        return [];
    }
};

export const getCompany = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/company/${id}`);
        return response.data;
    } catch (error) {
        console.error("Get Company Error:", error);
        throw error;
    }
};

export const getSimilarCompanies = async (companyId) => {
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/similar`);
        return response.data;
    } catch (error) {
        console.error("Similarity Error:", error);
        return [];
    }
};

export const getBatchExport = async () => {
    try {
        const response = await axios.get(`${API_URL}/batch/export`, {
            responseType: 'blob',
        });
        return response.data
    } catch (error) {
        console.error("Export Batch Error:", error);
        throw error;
    }
};

export const getStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error("Stats Error:", error);
        return {
            totalCompanies: 0,
            processedToday: 0,
            successRate: 0,
            avgProcessingTime: '0s',
            industryDistribution: []
        };
    }
};

export const exportSingleCompany = async (companyId, format = 'xlsx') => {
    try {
        const response = await axios.get(`${API_URL}/company/${companyId}/export?format=${format}`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `company_export.${format}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (error) {
        console.error("Export Single Error:", error);
        throw error;
    }
};
