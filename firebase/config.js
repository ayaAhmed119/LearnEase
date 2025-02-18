//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXqR2opTP2-fgY3NGj3QDts05ELvaf62Q",
  authDomain: "e-learning-8cac5.firebaseapp.com",
  databaseURL: "https://e-learning-8cac5-default-rtdb.firebaseio.com/",
  projectId: "e-learning-8cac5",
  storageBucket: "e-learning-8cac5.firebasestorage.app",
  messagingSenderId: "302191372624",
  appId: "1:302191372624:web:75536cdc3e3f1ad657a455",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
// Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDZNVofYeeiFtjIvsbHm8HqwCXdvZ7a9IY",
//   authDomain: "e-learning-8775c.firebaseapp.com",
//   databaseURL: "https://e-learning-8775c-default-rtdb.firebaseio.com/", // رابط قاعدة البيانات
//   projectId: "e-learning-8775c",
//   storageBucket: "e-learning-8775c.appspot.com",
//   messagingSenderId: "272327854098",
//   appId: "1:272327854098:web:25ad43c1198d010541b0cb",
// };

// // Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const database = firebase.database();
