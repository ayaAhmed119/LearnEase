document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase (if not already initialized in config.js)
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const database = firebase.database();

  // Extract courseId from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  console.log(courseId);

  if (!courseId) {
    console.error("Course ID not found in URL!");
    alert("Invalid course URL. Please check the link and try again.");
    return;
  }

  // Fetch course data from Firebase
  function fetchCourseData(courseId, callback) {
    const courseRef = database.ref(`courses/${courseId}`);
    courseRef
      .once("value", (snapshot) => {
        const course = snapshot.val();
        if (course) {
          callback(course);
        } else {
          console.error("Course not found!");
          alert("Course not found. Please check the URL and try again.");
        }
      })
      .catch((error) => {
        console.error("Error fetching course data:", error);
        alert(
          "An error occurred while fetching the course data. Please try again."
        );
      });
  }

  // Fetch lessons for the course from Firebase
  // function fetchLessons(courseId, callback) {
  //   const lessonsRef = database.ref(`courses/${courseId}/lessons`);
  //   lessonsRef
  //     .once("value", (snapshot) => {
  //       const lessons = snapshot.val();
  //       if (lessons) {
  //         callback(lessons);
  //       } else {
  //         console.error("No lessons found for this course!");
  //         alert("No lessons found for this course.");
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching lessons:", error);
  //       alert(
  //         "An error occurred while fetching the lessons. Please try again."
  //       );
  //     });
  // }
  fetchLessons(courseId, (lessons) => {
    console.log("Lessons loaded:", lessons);
  });

  // Find if lessons watched or no 
  function markLessonAsWatched(lessonId, lessons) {
    database.ref(`students-courses/${studentId}_${courseId}/watched/${lessonId}`).set(true);
    database.ref(`students-courses/${studentId}_${courseId}/watched`).once("value", (snapshot) => {
      const watchedLessons = snapshot.val() || {};
      const completedLessons = Object.keys(watchedLessons).length;
      updateProgress(completedLessons, Object.keys(lessons).length);
      if (completedLessons === Object.keys(lessons).length) {
        document.getElementById("certificate-button").style.display = "block";
      }
    });
  }

  // When Student Watches Last Lesson, Get Certificate
  function checkIfAllLessonsWatched(studentId, courseId, lessons) {
    const lessonIds = Object.keys(lessons);
    let watchedCount = 0;
  
    lessonIds.forEach((lessonId) => {
      const studentLessonRef = database.ref(`students-lessons/${studentId}_${courseId}_${lessonId}`);
      studentLessonRef.once("value", (snapshot) => {
        if (snapshot.exists() && snapshot.val().watched) {
          watchedCount++;
          if (watchedCount === lessonIds.length) {
            // All lessons watched, show certificate button
            document.getElementById("certificate-button").style.display = "block";
          }
        }
      });
    });
  }

  // Redirect To Certificate Page
  function redirectToCertificate() {
    window.location.href = `certificate.html?studentId=${studentId}&courseId=${courseId}`;
  }

  // Update progress par 
  function updateProgress(completedLessons, totalLessons) {
    const progress = Math.round((completedLessons / totalLessons) * 100);
    document.getElementById("progress-bar").style.width = `${progress}%`;
    document.getElementById("progress-text").textContent = `Progress: ${completedLessons}/${totalLessons} videos completed`;
    database.ref(`students-courses/${studentId}_${courseId}`).update({ progress });
  }

  // Connect Course ID with Student ID and Send Progress to Admin
  function updateStudentProgress(studentId, courseId, progress) {
    const studentCourseRef = database.ref(`students-courses/${studentId}_${courseId}`);
    studentCourseRef.update({
      progress: progress,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      console.log("Progress updated successfully");
    }).catch((error) => {
      console.error("Error updating progress:", error);
    });
  }

  // Display course data in the HTML
  function displayCourseData(course) {
    if (!course) {
      console.error("Course data is null or undefined.");
      return;
    }

    // Update the course title
    document.getElementById("course-title").textContent =
      course.title || "Introduction to the Course";

    // Update the course description
    document.getElementById("course-description").textContent =
      course.description ||
      "This course provides an overview of the essential tools and techniques needed to start your learning journey.";
  }

  // Display lessons in the HTML
  function displayLessons(lessons) {
    const courseContent = document.getElementById("course-content");
    courseContent.innerHTML = "";

    Object.entries(lessons).forEach(([lessonId, lesson], index) => {
      const lessonItem = document.createElement("div");
      lessonItem.className = "course-item";
      lessonItem.textContent = lesson.title || `Lesson ${index + 1}`;
      lessonItem.setAttribute("data-id", lessonId);
      lessonItem.setAttribute("data-video-url", lesson.videoUrl || "");
      lessonItem.setAttribute("data-description", lesson.description || "");

      // Add click event to load the lesson video and description
      lessonItem.addEventListener("click", () => {
        loadLesson(lesson);
      });

      courseContent.appendChild(lessonItem);
    });

    // Load the first lesson by default
    const firstLesson = Object.values(lessons)[0];
    if (firstLesson) {
      loadLesson(firstLesson);
    }
  }

  // Load a specific lesson
  function loadLesson(lesson) {
    if (!lesson) {
      console.error("Lesson data is null or undefined.");
      return;
    }

    document.getElementById("course-video").src =
      lesson.videoUrl ||
      "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1";
    document.getElementById("course-description").textContent =
      lesson.description || "No description available.";
  }

  // Handle "Previous" button click
  function prevVideo() {
    const currentLesson = document.querySelector(".course-item.current");
    if (currentLesson && currentLesson.previousElementSibling) {
      const prevLesson = currentLesson.previousElementSibling;
      const lesson = {
        videoUrl: prevLesson.getAttribute("data-video-url"),
        description: prevLesson.getAttribute("data-description"),
      };
      loadLesson(lesson);

      // Update active class
      currentLesson.classList.remove("current");
      prevLesson.classList.add("current");
    }
  }

  // Handle "Next" button click
  function nextVideo() {
    const currentLesson = document.querySelector(".course-item.current");
    if (currentLesson && currentLesson.nextElementSibling) {
      const nextLesson = currentLesson.nextElementSibling;
      const lesson = {
        videoUrl: nextLesson.getAttribute("data-video-url"),
        description: nextLesson.getAttribute("data-description"),
      };
      loadLesson(lesson);

      // Update active class
      currentLesson.classList.remove("current");
      nextLesson.classList.add("current");
    }
  }

  // Fetch and display the course data and lessons
  fetchCourseData(courseId, (course) => {
    displayCourseData(course);
    fetchLessons(courseId, (lessons) => {
      displayLessons(lessons);
    });
  });

  // Attach event listeners to buttons
  document.getElementById("prev-button").addEventListener("click", prevVideo);
  document.getElementById("next-button").addEventListener("click", nextVideo);
});
