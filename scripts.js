// Client ID and Scopes
const CLIENT_ID = '1024755388687-etqa242hdcc78fbm09bvoejvtm2np20r.apps.googleusercontent.com'; // Replace with your actual Client ID
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Collect all screens and initialize variables
const screens = Array.from(document.querySelectorAll('.screen'));
const backButton = document.querySelector('.back-button');
let currentStep = 0;
const formData = {};

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

// Validate input fields
function validateInput(currentId) {
    if (currentId === 'number') {
        const phoneNumber = document.getElementById('numberInput').value.trim();
        const phoneRegex = /^\d{10}$/; // Validate exactly 10 digits
        const cleanedNumber = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        if (!phoneRegex.test(cleanedNumber)) {
            Swal.fire('Please enter a valid 10-digit phone number.');
            return false;
        }
        formData[currentId] = cleanedNumber; // Use cleaned number without non-numeric characters
    } else if (currentId === 'email') {
        const email = document.getElementById('emailInput').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validate email format
        if (!emailRegex.test(email)) {
            Swal.fire('Please enter a valid email address.');
            return false;
        }
        formData[currentId] = email;
    } else {
        const input = document.getElementById(`${currentId}Input`);
        if (input.required && input.value.trim() === '') {
            Swal.fire('This field is required!');
            return false;
        }
        formData[currentId] = input.value.trim();
    }
    return true;
}


// Validate input and navigate to the next screen
function validateAndNext(currentId, nextId) {
    if (validateInput(currentId)) {
        nextScreen(nextId);
    }
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

// Submit the form data to the backend
async function submitFormToBackend() {
    const backendUrl = 'https://contact-server-e4ge.onrender.com/api/customer-data'; // Replace with your backend URL
    formData.city = document.getElementById('cityInput').value.trim(); // Save the city value
    console.log('Form Data:', formData);

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                number: formData.number,
                email: formData.email,
                city: formData.city,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server Error: ${errorText}`);
        }

        const result = await response.json();
        console.log('Form submitted successfully:', result);

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Your Details have been saved',
            showConfirmButton: false,
            timer: 1500,
        });

        showScreen(screens.length - 1); // Show the "Thank You" screen
        clearInputs(); // Clear all inputs after successful submission
    } catch (error) {
        console.error('Error submitting form:', error);
        Swal.fire('Error submitting form', error.message || 'Please try again.', 'error');
    }
}

// Initial setup
showScreen(currentStep);
