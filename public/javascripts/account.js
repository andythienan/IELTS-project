const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordRules = document.getElementById("password-rules");
const passwordError = document.getElementById("password-error");
const continueButton = document.getElementById("continue-button");

const ruleLength = document.getElementById("rule-length");
const ruleNumber = document.getElementById("rule-number");
const ruleSpecial = document.getElementById("rule-special");

const tabs = document.querySelectorAll('.tab');
const formAreas = document.querySelectorAll('.form-area');

passwordRules.addEventListener("copy", (event) => {
  event.preventDefault(); // Prevent default copy behavior
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs
    tabs.forEach(t => t.classList.remove('active'));

    // Toggle the 'hidden' class for form areas
    formAreas.forEach(f => f.classList.add('hidden'));

    // Add active class to the clicked tab
    tab.classList.add('active');

    // Remove 'hidden' class to show the corresponding form area
    const target = tab.dataset.target;
    document.getElementById(target).classList.remove('hidden');
  });
});

// Initially, hide the signup form and show the login form
document.getElementById('signup').classList.add('hidden');
document.getElementById('login').classList.remove('hidden');

const validatePassword = () => {
  const password = passwordInput.value;

  // Check password rules
  const isLongEnough = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  ruleLength.classList.toggle("valid", isLongEnough);
  ruleLength.classList.toggle("invalid", !isLongEnough);

  ruleNumber.classList.toggle("valid", hasNumber);
  ruleNumber.classList.toggle("invalid", !hasNumber);

  ruleSpecial.classList.toggle("valid", hasSpecialChar);
  ruleSpecial.classList.toggle("invalid", !hasSpecialChar);

  // Enable/disable confirm password field
  const isValidPassword = isLongEnough && hasNumber && hasSpecialChar;
  confirmPasswordInput.disabled = !isValidPassword;

  if (!isValidPassword) {
    confirmPasswordInput.value = "";
    validatePasswordMatch(); // Reset validation
  } else {
    validatePasswordMatch();
  }
};

const validatePasswordMatch = () => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword && password !== confirmPassword) {
    confirmPasswordInput.classList.add("error");
    passwordError.style.display = "block";
    continueButton.disabled = true;
  } else {
    confirmPasswordInput.classList.remove("error");
    passwordError.style.display = "none";
  }

  const isValidPassword =
    !ruleLength.classList.contains("invalid") &&
    !ruleNumber.classList.contains("invalid") &&
    !ruleSpecial.classList.contains("invalid") &&
    password === confirmPassword;

  continueButton.disabled = !isValidPassword;
};

passwordInput.addEventListener("focus", () => {
  passwordRules.style.display = "block";
});

passwordInput.addEventListener("blur", () => {
  if (passwordInput.value === "") {
    passwordRules.style.display = "none";
  }
});

passwordInput.addEventListener("input", validatePassword);
confirmPasswordInput.addEventListener("input", validatePasswordMatch);

async function checkEmailAvailability() {
        const emailField = document.getElementById('email');
        const errorMessage = document.getElementById('email-error');
        const validMessage = document.getElementById('email-valid');

        try {
            const response = await fetch(`/api/check-email?email=${encodeURIComponent(emailField.value)}`);
            const result = await response.json();

            if (result.exists) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'This email is already taken.';
                validMessage.style.display = 'none';
                passwordInput.disable=true;
            } else {
                validMessage.style.display = 'block';
                validMessage.textContent = 'This email is available.';
                errorMessage.style.display = 'none';
                passwordInput.disabled=false;
            }
        } catch (error) {
            console.error('Error checking email:', error);
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Error checking email. Please try again.';
            validMessage.style.display = 'none';
        }
    }

    passwordRules.addEventListener("copy", (event) => {
      const selection = window.getSelection();
      const selectedText = selection.toString();
    
      // Only prevent default behavior if the selection contains HTML/CSS
      if (selectedText && !/^\s*$/.test(selectedText)) { // Check for non-whitespace content
        event.preventDefault();
        const plainText = selectedText.replace(/<[^>]+>/g, ''); // Remove HTML tags
        navigator.clipboard.writeText(plainText); // Copy plain text to clipboard
      }
    });