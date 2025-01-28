// Client ID and Scopes
const CLIENT_ID = '1024755388687-etqa242hdcc78fbm09bvoejvtm2np20r.apps.googleusercontent.com'; // Replace with your actual Client ID
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Collect all screens and initialize variables
const screens = Array.from(document.querySelectorAll('.screen'));
const backButton = document.querySelector('.back-button');
let currentStep = 0;
const formData = {};

// Load the Google API
function loadGoogleAPI() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES,
        }).then(() => {
            // Explicitly load the Sheets API
            return gapi.client.load('sheets', 'v4');
        }).then(() => {
            console.log('Google Sheets API initialized successfully.');
        }).catch((error) => {
            console.error('Error initializing Google API or Sheets API:', error);
        });
    });
}


// Initialize the Google API client
function initGoogleClient() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
    }).then(() => {
        console.log('Google API client initialized.');
    }).catch((error) => {
        console.error('Error initializing Google API client:', error);
    });
}

// Authenticate the user
function authenticate() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
        console.log('User authenticated.');
        submitFormToGoogleSheet(); // Call this only after successful authentication
    }).catch((error) => {
        console.error('Error during authentication:', error);
    });
}


// Update the progress bar
function updateProgress() {
    const progress = (currentStep / (screens.length - 2)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Show a specific screen based on the index
function showScreen(index) {
    screens.forEach((screen, i) => {
        screen.classList.toggle('active', i === index);
    });
    updateProgress();

    // Show or hide the back button based on the current screen
    backButton.classList.toggle('hidden', currentStep === 0);
}

// Navigate back to the previous screen
function goBack() {
    if (currentStep > 0) {
        currentStep--;
        showScreen(currentStep);
    }
}

// Navigate to a specific screen by ID
function nextScreen(screenId) {
    currentStep++;
    const nextScreen = screens.find((screen) => screen.id === screenId);
    showScreen(screens.indexOf(nextScreen));
}

// Validate input and navigate to the next screen
function validateAndNext(currentId, nextId) {
    if (currentId === 'number') {
        const countryCode = document.getElementById('countryCode').value;
        const phoneNumber = document.getElementById('numberInput').value.trim();
        if (phoneNumber === '') {
            Swal.fire('Phone number is required.');
            return;
        }
        formData[currentId] = `${countryCode} ${phoneNumber}`;
    } else {
        const input = document.getElementById(`${currentId}Input`);
        if (input.required && input.value.trim() === '') {
            Swal.fire('This field is required!');
            return;
        }
        formData[currentId] = input.value.trim();
    }
    nextScreen(nextId);
}

// Clear all inputs
function clearInputs() {
    document.querySelectorAll('input').forEach((input) => {
        input.value = '';
    });
    Object.keys(formData).forEach((key) => {
        formData[key] = '';
    });
}

// Submit the form data to Google Sheets
async function submitFormToGoogleSheet() {
    if (!gapi.client.sheets) {
        console.error('Google Sheets API not loaded.');
        Swal.fire('Error', 'Google Sheets API is not loaded. Please try again.', 'error');
        return;
    }

    const sheetId = '1KSyxs79sns62OcVz-keYZAToF15HIT8uKON-B-NpQqw'; // Replace with your spreadsheet ID
    const sheetName = 'Contacts Data'; // Replace with your sheet/tab name

    formData.city = document.getElementById('cityInput').value.trim(); // Save the city value
    console.log('Submitting Form Data:', formData);

    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: `${sheetName}!A1`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[formData.name, formData.number, formData.email, formData.city]],
            },
        });

        console.log('Form submitted successfully:', response);
        Swal.fire('Success!', 'Your details have been saved.', 'success');
    } catch (error) {
        console.error('Error submitting form:', error);
        Swal.fire('Error', 'Failed to submit the form. Please try again.', 'error');
    }
}



// Initial setup
showScreen(currentStep);
loadGoogleAPI();
