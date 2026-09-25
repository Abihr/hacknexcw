export function getFirebaseErrorMessage(error) {
  switch (error.code) {
    // Login
    case "auth/invalid-credential":
      return "Invalid email or password.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    // Signup
    case "auth/email-already-in-use":
      return "An account with this email already exists.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    // General
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    default:
      console.error("Firebase error:", error);
      return "Something went wrong. Please try again.";
  }
}