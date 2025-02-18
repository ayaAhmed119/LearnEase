document.addEventListener("DOMContentLoaded", initCoursePage);

let currentLessonIndex = 0;
let lessonsList = [];
let currentCourseId = null;
let currentStudentId = null;

function initCoursePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");
  currentCourseId = courseId;

  const student = Storage.fetchLocalData("userData");
  if (student) {
    currentStudentId = student.uid;
  }

  if (!courseId) {
    console.error("Course ID not found in URL!");
    alert("Invalid course URL. Please check the link and try again.");
    return;
  }

  fetchCourseById( courseId,( course ) => {
    displayCourseData(course);
    fetchLessons(courseId, (lessons) => {
      lessonsList = Object.entries(lessons).map(([id, lesson]) => ({
        id,
        ...lesson,
      }));
      displayLessons(lessons);
      updateNavigationButtons();
    });
  });

  attachEventListeners();
  setupReviewForm();
}

function displayCourseData(course) {
  if (!course) return;

  document.getElementById("course-title").textContent =
    course.title || "Course Title";
  document.getElementById("course-description").textContent =
    course.description || "No description available.";
}

function displayLessons(lessons) {
  const courseContent = document.getElementById("course-content");
  courseContent.innerHTML = "";

  Object.entries(lessons).forEach(([lessonId, lesson], index) => {
    const lessonItem = document.createElement("div");
    lessonItem.className = "course-item";
    if (index === currentLessonIndex) {
      lessonItem.classList.add("current");
    }
    lessonItem.textContent = lesson.title || `Lesson ${index + 1}`;
    lessonItem.dataset.id = lessonId;
    lessonItem.dataset.index = index;

    lessonItem.addEventListener("click", () => {
      currentLessonIndex = index;
      updateCurrentLesson();
      loadLesson(lesson);
      updateNavigationButtons();
    });

    courseContent.appendChild(lessonItem);
  });

  if (lessonsList.length > 0) {
    loadLesson(lessonsList[0]);
  }
}

function loadLesson(lesson) {
  if (!lesson) return;

  document.getElementById("course-video").src =
    lesson.videoUrl ||
    "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1";
  document.getElementById("course-description").textContent =
    lesson.description || "No description available.";
  if (currentStudentId && currentCourseId) {
    markLessonAsWatched(currentStudentId, currentCourseId, lesson.id);
  }
}

function updateCurrentLesson() {
  // Remove current class from all lessons
  document.querySelectorAll(".course-item").forEach((item) => {
    item.classList.remove("current");
  });

  // Add current class to current lesson
  const currentItem = document.querySelector(
    `[data-index="${currentLessonIndex}"]`
  );
  if (currentItem) {
    currentItem.classList.add("current");
  }
}

function updateNavigationButtons() {
  const prevButton = document.getElementById("prev-button");
  const nextButton = document.getElementById("next-button");

  prevButton.disabled = currentLessonIndex === 0;

  nextButton.disabled = currentLessonIndex === lessonsList.length - 1;
}

function changeVideo(direction) {
  const newIndex =
    direction === "prev" ? currentLessonIndex - 1 : currentLessonIndex + 1;

  if (newIndex >= 0 && newIndex < lessonsList.length) {
    currentLessonIndex = newIndex;
    loadLesson(lessonsList[newIndex]);
    updateCurrentLesson();
    updateNavigationButtons();
  }
}

function setupReviewForm() {
  // Create review form HTML
  const reviewFormHTML = `
    <div id="review-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <h2>Course Review</h2>
        <form id="review-form">
          <div class="rating">
            <label>Rating:</label>
            <select name="rating" required>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
          </div>
          <div class="comment">
            <label>Your Review:</label>
            <textarea name="comment" required minlength="10" rows="4"></textarea>
          </div>
          <div class="form-buttons">
            <button type="submit">Submit Review</button>
            <button type="button" onclick="closeReviewModal()">Cancel</button>
          </div>
        </form>
      </div>
    </div>`;

  // Add form to the document
  document.body.insertAdjacentHTML("beforeend", reviewFormHTML);

  // Add event listener for form submission
  document
    .getElementById("review-form")
    .addEventListener("submit", submitReview);
}

function showReviewModal() {
  document.getElementById("review-modal").style.display = "block";
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
}

function prevVideo() {
  changeVideo("prev");
}

function nextVideo() {
  changeVideo("next");
}

function submitReview(event) {
  event.preventDefault();
  const form = event.target;
  const rating = form.rating.value;
  const comment = form.comment.value;

  // Save review to Firebase
  database
    .ref(`students-courses/${currentStudentId}_${currentCourseId}/review`)
    .set({
      rating: parseInt(rating),
      comment: comment,
      timestamp: Date.now(),
    })
    .then(() => {
      alert("Thank you for your review!");
      closeReviewModal();
    })
    .catch((error) => {
      console.error("Error saving review:", error);
      alert("Failed to submit review. Please try again.");
    });
}

function updateProgress(studentId, courseId) {
  const studentCourseRef = database.ref(
    `students-courses/${studentId}_${courseId}`
  );

  studentCourseRef.once("value", (snapshot) => {
    const studentCourseData = snapshot.val();
    if (!studentCourseData || !studentCourseData.watched) {
      console.error("No student course data or watched field found!");
      return;
    }

    const watchedLessons = studentCourseData.watched;
    const totalLessons = Object.keys(watchedLessons).length;
    const completedLessons = Object.values(watchedLessons).filter(
      (watched) => watched
    ).length;

    const progress = Math.round((completedLessons / totalLessons) * 100);

    studentCourseRef.update({ progress });

    document.getElementById("progress-bar").style.width = `${progress}%`;
    document.getElementById(
      "progress-text"
    ).textContent = `Progress: ${completedLessons}/${totalLessons} videos completed`;
    if (completedLessons === totalLessons) {
      document.getElementById("certificate-button").style.display = "block";
    }
  });
}

function markLessonAsWatched(studentId, courseId, lessonId) {
  if (!studentId || !courseId || !lessonId) {
    console.error("Invalid studentId, courseId, or lessonId!");
    return;
  }

  const watchedRef = database.ref(
    `students-courses/${studentId}_${courseId}/watched/${lessonId}`
  );

  watchedRef
    .set(true) // Set the lesson as watched
    .then(() => {
      console.log(`Lesson ${lessonId} marked as watched.`);
      updateProgress(studentId, courseId); // Update progress after marking as watched
    })
    .catch((error) => {
      console.error("Error marking lesson as watched:", error);
    });
}

function redirectToCertificate(courseId) {
  window.location.href = `certificate.html?id=${courseId}`;
}

function attachEventListeners() {
  document.getElementById("prev-button").addEventListener("click", prevVideo);
  document.getElementById("next-button").addEventListener("click", nextVideo);
  document
    .getElementById("certificate-button")
    .addEventListener("click", () => {
      if (currentStudentId && currentCourseId) {
        redirectToCertificate(currentCourseId);
      }
    });
  document
    .getElementById("review-button")
    .addEventListener("click", showReviewModal);
}
