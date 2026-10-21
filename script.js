"use strict";

const form = document.getElementById("reportForm");
const status = document.getElementById("formStatus");

const fields = [
    {
        id: "studentName",
        errorId: "studentNameError",
        validate: (field) => {
            const value = field.value.trim();

            if (!value) return "Please enter your full name.";
            if (value.length < 2) return "Your name must contain at least 2 characters.";
            if (value.length > 80) return "Your name cannot exceed 80 characters.";

            return "";
        }
    },
    {
        id: "email",
        errorId: "emailError",
        validate: (field) => {
            const value = field.value.trim();

            if (!value) return "Please enter your email address.";
            if (value.length > 120) return "Your email cannot exceed 120 characters.";

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return "Please enter a valid email address.";
            }

            return "";
        }
    },
    {
        id: "phone",
        errorId: "phoneError",
        validate: (field) => {
            const value = field.value.trim();

            if (!value) return "Please enter your phone number.";

            if (!/^[0-9+() -]{9,20}$/.test(value)) {
                return "Enter 9–20 characters using digits, spaces, +, parentheses or hyphens.";
            }

            if (!/[0-9]/.test(value)) {
                return "Your phone number must contain digits.";
            }

            return "";
        }
    },
    {
        id: "category",
        errorId: "categoryError",
        validate: (field) => {
            if (!field.value) return "Please select a problem category.";
            return "";
        }
    },
    {
        id: "location",
        errorId: "locationError",
        validate: (field) => {
            const value = field.value.trim();

            if (!value) return "Please enter the campus location.";
            if (value.length < 3) return "Enter at least 3 characters.";
            if (value.length > 100) return "The location cannot exceed 100 characters.";

            return "";
        }
    },
    {
        id: "dateObserved",
        errorId: "dateObservedError",
        validate: (field) => {
            if (!field.value) return "Please select the date the problem was observed.";

            const selectedDate = new Date(field.value + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (Number.isNaN(selectedDate.getTime())) {
                return "Please enter a valid date.";
            }

            if (selectedDate > today) {
                return "The observed date cannot be in the future.";
            }

            return "";
        }
    },
    {
        id: "description",
        errorId: "descriptionError",
        validate: (field) => {
            const value = field.value.trim();

            if (!value) return "Please describe the campus problem.";
            if (value.length < 10) return "Please provide at least 10 characters.";
            if (value.length > 1000) return "The description cannot exceed 1,000 characters.";

            return "";
        }
    },
    {
        id: "photo",
        errorId: "photoError",
        validate: (field) => {
            if (field.files.length === 0) return "";

            const file = field.files[0];
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                return "Please select a PNG, JPG or WebP image.";
            }

            if (file.size > 5 * 1024 * 1024) {
                return "The image must be 5 MB or smaller.";
            }

            return "";
        }
    }
];

function validateField(fieldConfig) {
    const field = document.getElementById(fieldConfig.id);
    const errorElement = document.getElementById(fieldConfig.errorId);
    const message = fieldConfig.validate(field);

    field.setAttribute("aria-invalid", String(Boolean(message)));
    errorElement.textContent = message;

    return message;
}

function validateUrgency() {
    const selected = form.querySelector('input[name="urgency"]:checked');
    const errorElement = document.getElementById("urgencyError");
    const group = form.querySelector(".urgency-group");
    const message = selected ? "" : "Please select the urgency level.";

    group.setAttribute("aria-invalid", String(Boolean(message)));
    errorElement.textContent = message;

    form.querySelectorAll('input[name="urgency"]').forEach((radio) => {
        radio.setAttribute("aria-invalid", String(Boolean(message)));
    });

    return message;
}

function validateAgreement() {
    const field = document.getElementById("agreement");
    const errorElement = document.getElementById("agreementError");
    const message = field.checked
        ? ""
        : "Please confirm that the information is accurate.";

    field.setAttribute("aria-invalid", String(Boolean(message)));
    errorElement.textContent = message;

    return message;
}

function clearStatus() {
    status.textContent = "";
    status.className = "status-message";
}

function validateAll() {
    const errors = [];

    fields.forEach((config) => {
        const message = validateField(config);
        if (message) errors.push(message);
    });

    const urgencyMessage = validateUrgency();
    if (urgencyMessage) errors.push(urgencyMessage);

    const agreementMessage = validateAgreement();
    if (agreementMessage) errors.push(agreementMessage);

    return errors;
}

// Validate individual fields as users type or change their answers.
fields.forEach((config) => {
    const field = document.getElementById(config.id);

    ["input", "change", "blur"].forEach((eventName) => {
        field.addEventListener(eventName, () => {
            validateField(config);
            clearStatus();
        });
    });
});

form.querySelectorAll('input[name="urgency"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        validateUrgency();
        clearStatus();
    });
});

document.getElementById("agreement").addEventListener("change", () => {
    validateAgreement();
    clearStatus();
});

// Submit only when every field is valid.
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = validateAll();

    if (errors.length > 0) {
        status.className = "status-message failure";
        status.textContent =
            `Your report has ${errors.length} validation error(s). Please correct the fields indicated below.`;

        // Focus the first invalid field, or the first radio in an invalid group.
        const firstInvalid = form.querySelector('[aria-invalid="true"]');

        if (firstInvalid) {
            firstInvalid.focus();
        }

        return;
    }

    status.className = "status-message success";
    status.textContent =
        "Your report passed validation. This demonstration does not save reports to a database.";

    status.focus();
});

// Clear custom errors when the user resets the form.
form.addEventListener("reset", () => {
    window.setTimeout(() => {
        fields.forEach((config) => {
            const field = document.getElementById(config.id);
            const errorElement = document.getElementById(config.errorId);

            field.removeAttribute("aria-invalid");
            errorElement.textContent = "";
        });

        form.querySelectorAll('[name="urgency"]').forEach((radio) => {
            radio.removeAttribute("aria-invalid");
        });

        document.getElementById("urgencyError").textContent = "";
        document.querySelector(".urgency-group").removeAttribute("aria-invalid");

        document.getElementById("agreement").removeAttribute("aria-invalid");
        document.getElementById("agreementError").textContent = "";

        clearStatus();
    }, 0);
});