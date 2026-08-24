/**
 * Contact Form with Validation and Submission
 *
 * Build a contact form that validates user input and submits data to an API.
 * API: POST https://dummyjson.com/users/add
 * Request body: { firstName, lastName, email, age }
 * Response: { id, firstName, lastName, email, age } (the created user with an assigned id)
 *
 * Requirements:
 * 1. Render a form with fields: First Name, Last Name, Email, Age, and a Submit button.
 * 2. All fields are required. Show inline validation errors when a field is empty on blur.
 *
 * 3. Email must be a valid format. Age must be a positive number.
 * 4. The Submit button should be disabled while any field is invalid or empty.
 *
 * 5. On submit, POST the data to the API. Show a loading state while the request is in flight.
 * 6. On success, show a success message with the created user's name and clear the form.
 * 7. On error, show an error message and keep the form data so the user can retry.
 *
 * Stretch:
 * - Prevent double submission (disable the button while submitting).
 * - Add a Reset button that clears all fields and validation errors.
 */

import {
  useState,
  type FormEvent,
  type ReactEventHandler,
  type SubmitEventHandler,
} from "react";
import styles from "./ContactForm.module.css";

const ADD_USER_URL = "https://dummyjson.com/users/add";

const defaultUserObject = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
};

const userPropertiesList = {
  firstName: {
    label: "First Name",
    placeholder: "John",
    errorMessage: "Please enter a valid first name.",
    type: "string",
  },
  lastName: {
    label: "Last Name",
    placeholder: "Smith",
    errorMessage: "Please enter a valid last name.",
    type: "string",
  },
  email: {
    label: "Email",
    placeholder: "john.smith@gmail.com",
    errorMessage: "Please enter a valid email.",
    type: "email",
  },
  age: {
    label: "Age",
    placeholder: "25",
    errorMessage: "Please enter a valid age.",
    type: "number",
  },
};

interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
}

type UserProperty = keyof User;

type FetchState = "loading" | "error" | "success";

export const ContactForm = () => {
  const [formData, setFormData] = useState<User>(defaultUserObject);
  const [hasBeenTouched, setHasBeenTouched] = useState<UserProperty[]>([]);
  const [fetchState, setFetchState] = useState<FetchState | undefined>(
    undefined,
  );
  const [fetchMessage, setFetchMessage] = useState<string | undefined>(
    undefined,
  );

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFetchState("loading");
    setFetchMessage("Loading...");
    fetch(ADD_USER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        setFetchState("success");
        setFetchMessage(
          `Successfully added ${data.firstName} ${data.lastName}!`,
        );
        setFormData(defaultUserObject);
        setHasBeenTouched([]);
      })
      .catch((error) => {
        setFetchState("error");
        setFetchMessage(`Something went wrong (${error}). Please try again.`);
      });
  };

  const onReset: ReactEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFormData(defaultUserObject);
    setHasBeenTouched([]);
  };

  const isPropertyValid = (property: UserProperty) => {
    switch (property) {
      case "firstName":
        return formData.firstName !== "";
      case "lastName":
        return formData.lastName !== "";
      case "email":
        return formData.email.includes("@");
      case "age":
        return parseInt(formData.age) > 0;
    }
  };

  const isFormDataValid =
    formData.firstName !== "" &&
    formData.lastName !== "" &&
    formData.email.includes("@") &&
    parseInt(formData.age) > 0;

  return (
    <div>
      <p>3. Build a contact form with validation and API submission.</p>
      {fetchState && <p>{fetchMessage}</p>}
      <form onSubmit={onSubmit} onReset={onReset}>
        <fieldset>
          <legend>Create a user</legend>
          {(Object.keys(userPropertiesList) as UserProperty[]).map(
            (property) => {
              const { label, placeholder, errorMessage, type } =
                userPropertiesList[property];

              return (
                <div key={property}>
                  <label htmlFor={property}>{label}</label>
                  <input
                    type={type}
                    id={property}
                    name={property}
                    placeholder={placeholder}
                    required={true}
                    value={formData[property]}
                    min={property === "age" ? 0 : undefined}
                    onChange={(event) => {
                      if (fetchState) {
                        setFetchMessage(undefined);
                        setFetchState(undefined);
                      }
                      setFormData({
                        ...formData,
                        [property]: event.currentTarget.value,
                      });
                    }}
                    onBlur={() => {
                      if (!hasBeenTouched.includes(property)) {
                        setHasBeenTouched([...hasBeenTouched, property]);
                      }
                    }}
                  />
                  {hasBeenTouched.includes(property) &&
                    !isPropertyValid(property) && (
                      <p style={{ color: "red", padding: "0", margin: "0" }}>
                        {errorMessage}
                      </p>
                    )}
                </div>
              );
            },
          )}

          {/* Submit & reset buttons  */}
          <div>
            <button
              type="submit"
              disabled={!isFormDataValid || fetchState === "loading"}
            >
              Submit
            </button>
            <button type="reset">Reset</button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

/**
 * List of concepts I needed to research:
 * - how to structure a web form using native HTML form elements
 * - how to show validation errors
 * - how to create a JSON from separate inputs
 * - how to send a request from form
 * - what fetch accepts as options (second argument), the function of headers and body
 * - if a form is controlled, should we not define attributes like type on the form and buttons and inputs?
 * - writing regex for form validation for common input types (ex. email)
 * - when abortcontroller is needed or not needed
 */
