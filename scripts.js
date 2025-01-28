// Collect all screens and initialize variables
const screens = Array.from(document.querySelectorAll('.screen'));
const backButton = document.querySelector('.back-button');
let currentStep = 0;
const formData = {};

// Update the progress bar
function updateProgress() {
    const progress = (currentStep / (screens.length-2)) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Show a specific screen based on the index
function showScreen(index) {
    screens.forEach((screen, i) => {
        screen.classList.toggle('active', i === index);
    });
    updateProgress();

    // Show or hide the back button based on the current screen
    if (currentStep === 0) {
        backButton.classList.add('hidden');
    } else {
        backButton.classList.remove('hidden');
    }
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
    formData.name = '';
    formData.number = '';
    formData.email = '';
    formData.city = '';
}

// Submit the form data to the backend
async function submitForm() {
    const cityInput = document.getElementById('cityInput');
    formData.city = cityInput.value.trim(); // Save the city value in formData

    console.log('Form Data:', formData);

    try {
        // Send the request to the backend
        const response = await fetch('https://contact-server-e4ge.onrender.com', {
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

        // Parse the response
        if (response.ok) {
            const result = await response.json();
            console.log('Form submitted successfully:', result);
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your Details have been saved',
                showConfirmButton: false,
                timer: 1500,
            });
            showScreen(screens.length - 1); // Show the "Thanks" screen
            clearInputs(); // Clear all inputs after successful submission
        } else {
            const error = await response.json();
            console.error('Error submitting form:', error);
            Swal.fire('Error submitting form', error.message || 'Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        Swal.fire('Error submitting form', 'Please try again.', 'error');
    }
}

// Initial setup
showScreen(currentStep);
