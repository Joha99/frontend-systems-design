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
 * 3. Email must be a valid format. Age must be a positive number.
 * 4. The Submit button should be disabled while any field is invalid or empty.
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
  type FormEventHandler,
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

const defaultVisitedMap = {
  firstName: false,
  lastName: false,
  email: false,
  age: false,
};

const fieldConfig = {
  firstName: {
    label: "First Name",
    placeholder: "John",
    errorMessage: "Please enter a valid first name.",
    type: "text",
  },
  lastName: {
    label: "Last Name",
    placeholder: "Smith",
    errorMessage: "Please enter a valid last name.",
    type: "text",
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

type User = {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
};

type UserProperty = keyof User;

type FetchResult = {
  state: "loading" | "error" | "success";
  message: string;
};

type VisitedMap = Record<UserProperty, boolean>;

export const ContactForm = () => {
  const [formData, setFormData] = useState<User>(defaultUserObject);
  const [visitedMap, setVisitedMap] = useState<VisitedMap>(defaultVisitedMap);
  const [fetchResult, setFetchResult] = useState<FetchResult | undefined>(
    undefined,
  );

  const userPropertyKeys = Object.keys(fieldConfig) as UserProperty[];

  const onSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFetchResult({
      state: "loading",
      message: "Loading...",
    });
    fetch(ADD_USER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        setFetchResult({
          state: "success",
          message: `Successfully added ${data.firstName} ${data.lastName}!`,
        });
        setFormData(defaultUserObject);
        setVisitedMap(defaultVisitedMap);
      })
      .catch((error) => {
        setFetchResult({
          state: "error",
          message: `Something went wrong (${error}). Please try again.`,
        });
      });
  };

  const onReset: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFormData(defaultUserObject);
    setVisitedMap(defaultVisitedMap);
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

  const isFormDataValid = !userPropertyKeys.some((property) => {
    return !isPropertyValid(property);
  });

  return (
    <div>
      <p>3. Build a contact form with validation and API submission.</p>
      {fetchResult && <p>{fetchResult.message}</p>}
      <form onSubmit={onSubmit} onReset={onReset}>
        <fieldset>
          <legend>Create a user</legend>
          {userPropertyKeys.map((property) => {
            const { label, placeholder, errorMessage, type } =
              fieldConfig[property];

            return (
              <div key={property}>
                <label htmlFor={property}>{label}</label>
                <input
                  type={type}
                  id={property}
                  name={property}
                  placeholder={placeholder}
                  value={formData[property]}
                  min={property === "age" ? 0 : undefined}
                  onChange={(event) => {
                    if (fetchResult) {
                      setFetchResult(undefined);
                    }
                    setFormData({
                      ...formData,
                      [property]: event.currentTarget.value,
                    });
                  }}
                  onBlur={() => {
                    if (!visitedMap[property]) {
                      setVisitedMap({ ...visitedMap, [property]: true });
                    }
                  }}
                />
                {visitedMap[property] && !isPropertyValid(property) && (
                  <p className={styles.errorMessage}>{errorMessage}</p>
                )}
              </div>
            );
          })}
          <div>
            <button
              type="submit"
              disabled={!isFormDataValid || fetchResult?.state === "loading"}
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
 * - hasBeenTouched as an array — using .includes() on every render is O(n). A Set<UserProperty> or Record<UserProperty, boolean> is the idiomatic choice for tracking membership.
 * - fetchState and fetchMessage update in lockstep. One state object like { status: "success", message: "..." } is cleaner and removes the risk of them getting out of sync.
 */
