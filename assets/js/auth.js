
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const showError = (elementId, message) => {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
};

const clearError = (elementId) => {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = "";
  }
};

// Firebase Functions
const registerUserWithFirebase = async (email, password, userDetails) => {
  try {
    // Create user with email and password
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    // Add user ID to user details
    userDetails.uid = user.uid; // Store the Firebase user ID

    // Save user details to Firebase database
    const databaseRef = database.ref("users/" + user.uid);
    await databaseRef.set(userDetails);

    console.log(
      "User registered and data saved successfully with ID:",
      user.uid
    );
    return user;
  } catch (error) {
    console.error("Error during registration: ", error);
    throw error;
  }
};

const loginUserWithFirebase = async (email, password) => {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password
    );
    const user = userCredential.user;

    const databaseRef = database.ref("users/" + user.uid);
    const snapshot = await databaseRef.once("value");
    const userData = snapshot.val();

    if (!userData) {
      throw new Error("User data not found in database.");
    }

    console.log("User data fetched successfully:", userData);

    // Save user data to local storage using the Storage object
    Storage.saveLocalData("userData", userData);
    return userData;
  } catch (error) {
    console.error("Error during login: ", error);
    throw error;
  }
};

// Form Handlers
const handleRegistration = async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const gender = document.getElementById("gender").value;

  // Validate email
  if (!validateEmail(email)) {
    showError("emailError", "Please enter a valid email address.");
    return;
  } else {
    clearError("emailError");
  }

  // Validate password
  if (!validatePassword(password)) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Prepare user details
  const userDetails = {
    name,
    phone,
    email,
    gender,
    last_login: Date.now(),
  };

  try {
    await registerUserWithFirebase(email, password, userDetails);
    alert("Registration successful! Redirecting to login page...");
    window.location.href = "login.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
};




const handleLogin = async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();


  if (!email || !password) {
    alert("Please fill in all fields.");
    return;
  }

  
  if (!validateEmail(email)) {
    showError("emailError", "Please enter a valid email address.");
    return;
  } else {
    clearError("emailError");
  }

  
  if (!validatePassword(password)) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // ** Hardcoded Admin Login **
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    alert( "Admin login successful! Redirecting to Admin Dashboard..." );
    Storage.saveLocalData("userData", { "email": email, "password":password });
    window.location.href = "./admin.html";
    return;
  }

  
  try {
    const userData = await loginUserWithFirebase(email, password);
    alert("Login successful! Redirecting to Home page...");
    window.location.href = "./student.html";
  } catch (error) {
    console.error("Error during login: ", error);

    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      alert("Invalid email or password. Please try again.");
    } else {
      alert("Error: " + error.message);
    }
  }
};

const registryForm = document.getElementById("registration-form");
if (registryForm) {
  registryForm.addEventListener("submit", handleRegistration);
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

// Function to Assign User to Course (Based on User ID)
const assignUserToCourse = async (userId, courseId) => {
  try {
    const courseRef = database.ref("courses/" + courseId + "/users");
    await courseRef.push({
      userId: userId,
      timestamp: Date.now(),
    });
    console.log(
      `User with ID ${userId} successfully assigned to course ${courseId}`
    );
  } catch (error) {
    console.error("Error assigning user to course: ", error);
  }
};
const logout = () => {
  alert("Logout successful! Redirecting to login page...");
  window.location.href = "../../login.html"; 
};
