import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../app/(auth)/signup";
import { createUserWithEmailAndPassword } from "firebase/auth";


jest.mock("expo-font", () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
}));

jest.mock("../firebase", () => ({
  auth: {},
  db: {},
}));

jest.mock("../components/ui/statusModal", () => {
  return function MockStatusModal({ visible, message }) {
    return visible ? message : null;
  };
});

jest.mock("../components/ui/animatedButton", () => {
  return function MockButton({ onPress, children }) {
    return (
      <button onClick={onPress}>
        {children}
      </button>
    );
  };
});


describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form after fonts load", async () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Full Name")).toBeTruthy();
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    const { getByText, findByText, getByPlaceholderText } =
      render(<SignUpScreen />);

    await waitFor(() => getByPlaceholderText("Full Name"));

    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Name must be at least 5 characters")).toBeTruthy();
    expect(await findByText("Invalid email format")).toBeTruthy();
    expect(
      await findByText(
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character."
      )
    ).toBeTruthy();
    expect(
      await findByText("You must accept the Terms & Conditions")
    ).toBeTruthy();
  });

  it("shows error when passwords do not match", async () => {
    const { getByPlaceholderText, getByText, findByText } =
      render(<SignUpScreen />);

    await waitFor(() => getByPlaceholderText("Full Name"));

    fireEvent.changeText(getByPlaceholderText("Full Name"), "Valid Name");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@email.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Password1!");
    fireEvent.changeText(getByPlaceholderText("Confirm Password"), "Password2!");

    fireEvent.press(getByText("Create Account"));

    expect(await findByText("Passwords do not match")).toBeTruthy();
  });

  it("shows loading text while creating user", async () => {
    createUserWithEmailAndPassword.mockImplementation(
      () => new Promise(() => {})
    );

    const {
      getByPlaceholderText,
      getByText,
      getByRole,
    } = render(<SignUpScreen />);

    await waitFor(() => getByPlaceholderText("Full Name"));

    fireEvent.changeText(getByPlaceholderText("Full Name"), "Valid Name");
    fireEvent.changeText(getByPlaceholderText("Email"), "test@email.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Password1!");
    fireEvent.changeText(
      getByPlaceholderText("Confirm Password"),
      "Password1!"
    );

    fireEvent(getByRole("switch"), "valueChange", true);

    fireEvent.press(getByText("Create Account"));

    await waitFor(() => {
      expect(getByText("Creating user...")).toBeTruthy();
    });
  });

  it("navigates to signin when link pressed", async () => {
    const { getByText, getByPlaceholderText } = render(<SignUpScreen />);

    await waitFor(() => getByPlaceholderText("Full Name"));

    fireEvent.press(getByText(/Sign in/));

    expect(mockPush).toHaveBeenCalledWith("/signin");
  });
});
