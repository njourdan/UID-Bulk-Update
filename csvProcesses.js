export const parseAttributeMapping = (fileContent) => {
    return new Promise((resolve, reject) => {
        const results = {};
        let currentAttributeSet = '';
        
        Papa.parse(fileContent, {
            header: false,
            skipEmptyLines: true,
            complete: (parsedData) => {
                parsedData.data.forEach((row, index) => {
                    if (index === 0) return; // Skip header row
                    const [Header, header, value] = row;
                    if (Header) {
                        currentAttributeSet = Header.trim();
                        results[currentAttributeSet] = [];
                    } else if (header && value) {
                        results[currentAttributeSet].push({
                            'typeName': header.trim(),
                            'value': value.trim(),
                        });
                    }
                });
                resolve(results);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const parseUIDList = (fileContent) => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (parsedData) => {
                const records = parsedData.data;
                const uids = records.map(item => item.UID);
                resolve(uids);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const addToFailList = (data) => {
    return new Promise((resolve, reject) => {
        // Convert data to CSV format
        const csvContent = Papa.unparse(data);

        // Create a blob from the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create a link element to download the blob as a file
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", 'fails.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            resolve();
        } else {
            reject(new Error("Failed to create download link"));
        }
    });
};
