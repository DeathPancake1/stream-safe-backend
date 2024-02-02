const axios = require('axios');
const fs = require('fs');

// Replace 'YOUR_API_ENDPOINT', 'YOUR_JWT_TOKEN', and 'YOUR_API_KEY' with your actual values
const apiEndpoint = 'http://localhost:3000/files/downloadVideo';
const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbWdlZEBnbWFpbC5jb20iLCJpYXQiOjE3MDY4MTQ1NTMsImV4cCI6MTcwNjkwMDk1M30.1ymYXMShpgtKF2L_cXSh6wWeVWWT-C5bKWJUMI1bjxw';
const apiKey = '0xmfpnzo4imq3k1aVUf5FfYBiFBlShQK';

// Replace 'YOUR_REQUEST_DATA' with the data you want to send in the POST request
const requestData = {
  path: 'storage\\videos\\amged@gmail.com_adam@gmail.com\\2dabdf579abe656215993ee8c1811187.iso',
};

// Axios request configuration
const axiosConfig = {
  method: 'post',
  url: apiEndpoint,
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'api-key': apiKey,
    'Content-Type': 'application/json',
    'accept': '*',
  },
  data: requestData,
};

// Function to make Axios request and write response to a file
async function makeAxiosRequest() {
  try {
    // Make Axios request
    const response = await axios(axiosConfig);

    // Write response to a text file (replace 'output.txt' with your desired file name)
    fs.writeFileSync('output.txt', JSON.stringify(response.data, null, 2));

    console.log('Response written to output.txt successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Call the function to initiate the process
makeAxiosRequest();
