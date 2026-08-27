/**
 * Multi-Step Form Wizard
 *
 * Build a multi-step form that collects user information across multiple pages.
 * API: POST https://dummyjson.com/users/add
 * Request body: { firstName, lastName, email, age, address: { city, state }, company: { name, title } }
 *
 * Steps:
 * 1. Personal Info — First Name, Last Name, Age
 * 2. Contact — Email
 * 3. Address — City, State (only shown if age >= 18)
 * 4. Work — Company Name, Job Title
 * 5. Review — display all entered data, confirm and submit
 *
 * Requirements:
 * 1. Show one step at a time with Next / Back buttons.
 * 2. Validate each step before allowing Next — highlight invalid fields.
 * 3. Show a progress indicator (e.g. "Step 2 of 5" or a progress bar).
 * 4. Preserve form data when navigating back and forward.
 * 5. Step 3 (Address) is conditionally shown only if age >= 18 — skip it otherwise.
 * 6. On the Review step, show all entered data. On submit, POST to the API.
 * 7. Show loading, success, and error states on submission.
 *
 * Stretch:
 * - Animate step transitions.
 * - Save draft to localStorage so data survives a page refresh.
 * - Allow clicking the progress indicator to jump to a completed step.
 */

import { type FormEvent, useState } from "react";

import styles from "./MultiStepWizard.module.css";

const API_URL = "https://dummyjson.com/users/add";

type Step = 1 | 2 | 3 | 4 | 5;

interface User {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  city: string;
  state: string;
  companyName: string;
  companyTitle: string;
}

interface InputConfig {
  id: keyof User;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  validation: boolean | RegExpMatchArray | null;
}

interface StepConfig {
  legend: string;
  inputs?: InputConfig[];
}

const defaultUser: User = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  city: "",
  state: "",
  companyName: "",
  companyTitle: "",
};

export const MultiStepWizard = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [userData, setUserData] = useState<User>(defaultUser);
  const [cannotAdvance, setCannotAdvance] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "loading" | "success" | "error" | undefined
  >(undefined);

  const isFirstNameValid = userData.firstName !== "";
  const isLastNameValid = userData.lastName !== "";
  const isAgeValid = userData.age !== "" && parseInt(userData.age) > 0;
  const isEmailValid = userData.email?.match(/\S+@\S+\.\S+/);
  const isCityValid = userData.city !== "";
  const isStateValid = userData.state !== "";
  const isCompanyNameValid = userData.companyName !== "";
  const isCompanyTitleValid = userData.companyTitle !== "";

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1:
        return isFirstNameValid && isLastNameValid && isAgeValid;
      case 2:
        return isEmailValid;
      case 3:
        return isCityValid && isStateValid;
      case 4:
        return isCompanyNameValid && isCompanyTitleValid;
      case 5:
        return true;
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitStatus("loading");
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        age: userData.age,
        address: { city: userData.city, state: userData.state },
        company: { name: userData.companyName, title: userData.companyTitle },
      }),
    })
      .then((response) => response.json())
      .then(() => {
        setSubmitStatus("success");
      })
      .catch(() => {
        setSubmitStatus("error");
      });
  };

  const onNext = () => {
    if (!isCurrentStepValid()) {
      setCannotAdvance(true);
    } else {
      setCannotAdvance(false);
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const stepFormProperties: Record<Step, StepConfig> = {
    1: {
      legend: "Personal Information",
      inputs: [
        {
          id: "firstName",
          label: "First name",
          type: "text",
          placeholder: "John",
          value: userData.firstName,
          validation: isFirstNameValid,
        },
        {
          id: "lastName",
          label: "Last name",
          type: "text",
          placeholder: "Smith",
          value: userData.lastName,
          validation: isLastNameValid,
        },
        {
          id: "age",
          label: "Age",
          type: "number",
          placeholder: "25",
          value: userData.age,
          validation: isAgeValid,
        },
      ],
    },
    2: {
      legend: "Contact",
      inputs: [
        {
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "john@gmail.com",
          value: userData.email,
          validation: isEmailValid,
        },
      ],
    },
    3: {
      legend: "Address",
      inputs: [
        {
          id: "city",
          label: "City",
          type: "text",
          placeholder: "Arlington",
          value: userData.city,
          validation: isCityValid,
        },
        {
          id: "state",
          label: "State",
          type: "text",
          placeholder: "Virginia",
          value: userData.state,
          validation: isStateValid,
        },
      ],
    },
    4: {
      legend: "Work",
      inputs: [
        {
          id: "companyName",
          label: "Company name",
          type: "text",
          placeholder: "Google",
          value: userData.companyName,
          validation: isCompanyNameValid,
        },
        {
          id: "companyTitle",
          label: "Job title",
          type: "text",
          placeholder: "Software Engineer",
          value: userData.companyTitle,
          validation: isCompanyTitleValid,
        },
      ],
    },
    5: {
      legend: "Review",
    },
  };

  if (submitStatus) {
    if (submitStatus === "loading") {
      return <p>Adding user...</p>;
    }
    if (submitStatus === "success") {
      return <p>Successfully added {userData.firstName}!</p>;
    }
    return <p>There was an issue adding {userData.firstName}.</p>;
  }

  return (
    <div>
      <p>6. Build a multi-step form wizard with conditional steps.</p>
      <div>
        <div className={styles.navigation}>
          <button
            disabled={currentStep === 1}
            onClick={() => {
              setCannotAdvance(false);
              setCurrentStep((prev) => (prev - 1) as Step);
            }}
          >
            Back
          </button>
          <p>Step {currentStep} of 5</p>
          <button disabled={currentStep === 5} onClick={onNext}>
            Next
          </button>
        </div>

        <form onSubmit={onSubmit}>
          {([1, 2, 3, 4] as Step[]).map((step) => {
            if (currentStep !== step) return null;
            const { legend, inputs } = stepFormProperties[step];
            if (!inputs) return null;

            return (
              <fieldset key={step}>
                <legend>{legend}</legend>
                {inputs.map((input) => (
                  <div key={input.id}>
                    <label htmlFor={input.id}>{input.label}</label>
                    <input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      value={input.value}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        setUserData((prev) => ({
                          ...prev,
                          [input.id]: value,
                        }));
                      }}
                      className={
                        cannotAdvance && !input.validation
                          ? styles["invalid-input"]
                          : undefined
                      }
                    />
                  </div>
                ))}
              </fieldset>
            );
          })}

          {currentStep === 5 && (
            <div>
              <p>
                Name: {userData.firstName} {userData.lastName}
              </p>
              <p>Age: {userData.age}</p>
              <p>Contact: {userData.email}</p>
              <p>
                Address: {userData.city}, {userData.state}
              </p>
              <p>
                Company: {userData.companyTitle} at {userData.companyName}
              </p>
              <button type="submit">Submit</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
