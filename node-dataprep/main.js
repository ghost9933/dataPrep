document.addEventListener('DOMContentLoaded', () => {

    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('fileInput');
    const userID = document.getElementById('userID');

    let selectedFile = null; // contains our complete file
    let jsonSelectedFile = null; // contains the json file
    let filename = null; // contains the filename without extension

    // prod IP
    const prod_ip = 'http://34.174.88.226:5000';
    const test_ip = 'http://localhost:5000';


    const sparkOperations = ['filter', 'withColumn', 'drop', 'groupBy', 'agg', 'orderBy', 'mean_normalization'];

    fileInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0]; // Store the selected file
    });

    uploadButton.addEventListener('click', async () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('userID', userID.value);

            console.log("User ID:", userID.value); // Log the userID value
            // tried using a localhost but dfacing issues with cors current stop gap fix is updating ip of the server here
            try {
                // hardcoded, need to update when we restart instance?!
                const response = await axios.post(`${prod_ip}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('File uploaded successfully:', response.data);
                alert("File uploaded successfully");

            } catch (error) {
                if (error.response && error.response.status === 500) {
                    alert("File uploaded successfully");
                    const lastDot = selectedFile.name.lastIndexOf('.');
                    filename = selectedFile.name.substring(0, lastDot);
                    console.log(filename);
                } else {
                    console.log('error:', error);
                    alert("File upload failed. Please try again.");
                }
            }
        } else {
            console.error('No file selected');
            alert("No file selected");
        }
    });

    let ruleCount = 0;

    document.getElementById('addRule').addEventListener('click', async () => {
        ruleCount++;

        const rulesContainer = document.getElementById('rulesContainer');

        const ruleDiv = document.createElement('div');
        ruleDiv.innerHTML = `
            <label for="columnName${ruleCount}">Column Name:</label>
            <input type="text" id="columnName${ruleCount}" name="columnName${ruleCount}" required>

            <label for="operation${ruleCount}">Operation:</label>
            <select id="operation${ruleCount}" name="operation${ruleCount}">
                ${sparkOperations.map(op => `<option value="${op}">${op}</option>`).join('')}
            </select>
            <br>
        `;

        rulesContainer.appendChild(ruleDiv);
    });

    document.getElementById('deleteRule').addEventListener('click', () => {
        if (ruleCount > 0) {
            const rulesContainer = document.getElementById('rulesContainer');
            rulesContainer.removeChild(rulesContainer.lastChild);
            ruleCount--;
        }
    });

    function displayJSON(json) {
        const jsonContainer = document.getElementById('jsonContainer');
        jsonContainer.innerHTML = `<pre>${JSON.stringify(json, null, 2)}</pre>`;
    }

    document.getElementById('cleaningForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const rules = [];

        for (let i = 1; i <= ruleCount; i++) {
            const columnName = document.getElementById(`columnName${i}`).value;
            const operation = document.getElementById(`operation${i}`).value;

            const rule = {
                column: columnName,
                operation: operation,
            };

            rules.push(rule);
        }

        const cleaningRulesJSON = JSON.stringify(rules, null, 2);
        console.log('Generated Cleaning Rules:', cleaningRulesJSON);

        // Display the generated JSON on the web page
        displayJSON(rules);

        const jsonfilename = `${filename}.json`;
        const jsonfilename_blob = new Blob([cleaningRulesJSON], { type: 'application/json' });

        const jsonNew = new File([jsonfilename_blob], jsonfilename, { type: 'application/json' });
        // json file created here
        console.log('JSONNew', jsonNew.name);
        console.log('JSONNew', jsonNew);

        // upload this created json file to gcs bucket in the same path 

        if (1) {
            const formData = new FormData();
            formData.append('file', jsonNew);
            formData.append('userID', userID.value);

            console.log("User ID:", userID.value); // Log the userID value
            // tried using a localhost but dfacing issues with cors current stop gap fix is updating ip of the server here
            try {
                // hardcoded, need to update when we restart instance?!
                const response = await axios.post(`${prod_ip}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Json File uploaded successfully:', response.data);
                alert("Json File uploaded successfully");

            } catch (error) {
                if (error.response && error.response.status === 500) {
                    alert("Json File uploaded successfully");
                } else {
                    console.log('error:', error);
                    alert("File upload failed. Please try again.");
                }
            }
        } else {
            console.error('No file selected');
            alert("No file selected");
        }

        const triggerJson = {
            "project_name": userID.value,
            "project_id": userID.value,
            "dataset_name": filename,
            "username": userID.value
        };

        console.log('Trigger JSON:', triggerJson);
        try {
            const apiUrl = 'http://34.174.88.226:8000/projects/jobsapi/';

            const response = await axios.post(apiUrl, triggerJson, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            console.log(response);



            console.log('Response:', response.data.download_url);

            document.getElementById("dataField").value = response.data.download_url;

            var dataField = document.getElementById("dataField");

            // Select the text in the textfield
            dataField.select();
            dataField.setSelectionRange(0, 99999); /* For mobile devices */

            // Copy the selected text to clipboard
            navigator.clipboard.writeText(dataField.value)
                .then(() => {
                    // Alert the user that the link is copied
                    alert("Link copied to clipboard: " + dataField.value);
                })
                .catch(error => {
                    console.error('Error copying to clipboard:', error);
                });
        } catch (error) {
            console.error('Error:', error);

            if (error.response && error.response.status === 500) {
                console.log('No response');
            } else {
                console.log('Error occurred');
            }
        }
    });
});