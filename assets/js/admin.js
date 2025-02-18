function openForm(formId) {
  document.getElementById(formId).style.display = "block";
}

function closeForm(formId) {
  document.getElementById(formId).style.display = "none";
}

function openAddLessonForm() {
  const courseSelect = document.getElementById("lesson-course");
  courseSelect.innerHTML = "";

  const coursesRef = database.ref("courses");
  coursesRef.once("value", (snapshot) => {
    const courses = snapshot.val();
    if (courses) {
      Object.keys(courses).forEach((key) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = courses[key].title;
        courseSelect.appendChild(option);
      });
    }
  });

  openForm("lessonForm");
}
function openForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.style.display = "block";
  } else {
    console.error(`Form with ID "${formId}" not found.`);
  }
}

function addLesson() {
  const courseId = document.getElementById("lesson-course").value;
  const title = document.getElementById("lesson-title").value.trim();
  const videoUrl = document.getElementById("lesson-video-url").value.trim();
  const description = document.getElementById("lesson-desc").value.trim();

  if (!courseId || !title || !videoUrl || !description) {
    alert("Please fill all fields!");
    return;
  }

  const lessonsRef = database.ref(`courses/${courseId}/lessons`);

  lessonsRef.once("value", (snapshot) => {
    const lessons = snapshot.val();
    let isDuplicate = false;

    if (lessons) {
      Object.values(lessons).forEach((lesson) => {
        if (lesson.title === title || lesson.videoUrl === videoUrl) {
          isDuplicate = true;
        }
      });
    }

    if (isDuplicate) {
      alert("Lesson with the same title or video URL already exists!");
    } else {
      const lesson = { title, videoUrl, description };
      lessonsRef
        .push(lesson)
        .then(() => {
          alert("Lesson added successfully!");
          closeForm("lessonForm");
          fetchLessons();
        })
        .catch((error) => {
          alert("Error adding lesson: " + error.message);
        });
    }
  });
}

function fetchLessons(courseId) {
  const lessonsRef = database.ref(`courses/${courseId}/lessons`);
  const tbody = document.querySelector("#lessons tbody");
  tbody.innerHTML = "";

  lessonsRef.once("value", (snapshot) => {
    const lessons = snapshot.val();
    if (lessons) {
      Object.keys(lessons).forEach((lessonId) => {
        const lesson = lessons[lessonId];
        const row = `
                  <tr>
                      <td>${lesson.lessonNumber}</td>
                      <td>${lesson.title}</td>
                      <td>${lesson.videoUrl}</td>
                      <td>${lesson.description}</td>
                      <td>
                          <button class="edit" onclick="openEditLessonForm('${courseId}', '${lessonId}')">Edit</button>
                          <button class="delete" onclick="deleteLesson('${courseId}', '${lessonId}')">Delete</button>
                      </td>
                  </tr>
              `;
        tbody.innerHTML += row;
      });
    }
  });
}

function openEditLessonForm(courseId, lessonId) {
  const lessonRef = database.ref(`courses/${courseId}/lessons/${lessonId}`);

  lessonRef.once("value", (snapshot) => {
    const lesson = snapshot.val();
    console.log("Lesson data:", lesson);
    document.getElementById("edit-lesson-title").value = lesson.title;
    document.getElementById("edit-lesson-video-url").value = lesson.videoUrl;
    document.getElementById("edit-lesson-desc").value = lesson.description;

    const submitButton = document.querySelector("#editLessonForm .submit-btn");
    submitButton.onclick = () => editLesson(courseId, lessonId);

    openForm("editLessonForm");
  });
}

function editLesson(courseId, lessonId) {
  const title = document.getElementById("edit-lesson-title").value;
  const videoUrl = document.getElementById("edit-lesson-video-url").value;
  const description = document.getElementById("edit-lesson-desc").value;

  if (!title || !videoUrl || !description) {
    alert("Please fill all fields!");
    return;
  }

  const lessonsRef = database.ref(`courses/${courseId}/lessons`);

  lessonsRef.once("value", (snapshot) => {
    const lessons = snapshot.val();
    let isDuplicate = false;

    if (lessons) {
      Object.keys(lessons).forEach((key) => {
        if (
          key !== lessonId &&
          (lessons[key].title === title || lessons[key].videoUrl === videoUrl)
        ) {
          isDuplicate = true;
        }
      });
    }

    if (isDuplicate) {
      alert("Lesson with the same title or video URL already exists!");
    } else {
      const updatedLesson = { title, videoUrl, description };

      database
        .ref(`courses/${courseId}/lessons/${lessonId}`)
        .update(updatedLesson)
        .then(() => {
          alert("Lesson updated successfully!");
          closeForm("editLessonForm");
          fetchLessons(courseId);
        })
        .catch((error) => {
          alert("Error updating lesson: " + error.message);
        });
    }
  });
}

function deleteLesson(courseId, lessonId) {
  if (confirm("Are you sure you want to delete this lesson?")) {
    database
      .ref(`courses/${courseId}/lessons/${lessonId}`)
      .remove()
      .then(() => {
        alert("Lesson deleted successfully!");
        fetchLessons(courseId);
      })
      .catch((error) => {
        alert("Error deleting lesson: " + error.message);
      });
  }
}

function fetchLessons() {
  const lessonsTable = document.getElementById("lessons-table-body");
  lessonsTable.innerHTML = "";

  const coursesRef = database.ref("courses");
  coursesRef.once("value", (coursesSnapshot) => {
    const courses = coursesSnapshot.val();
    if (courses) {
      Object.keys(courses).forEach((courseId) => {
        const course = courses[courseId];
        const lessonsRef = database.ref(`courses/${courseId}/lessons`);

        lessonsRef.once("value", (lessonsSnapshot) => {
          const lessons = lessonsSnapshot.val();
          if (lessons) {
            Object.keys(lessons).forEach((lessonId) => {
              const lesson = lessons[lessonId];
              const row = `
                              <tr>
                                  <td>${course.title}</td> 
                                  <td>${lesson.title}</td>
                                
                                  <td><a href="${lesson.videoUrl}" target="_blank">Watch Video</a></td>
                                  <td>
                                      <button class="edit" onclick="openEditLessonForm('${courseId}', '${lessonId}')">Edit</button>
                                      <button class="delete" onclick="deleteLesson('${courseId}', '${lessonId}')">Delete</button>
                                  </td>
                              </tr>
                          `;
              lessonsTable.innerHTML += row;
            });
          }
        });
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const student = Storage.fetchLocalData("userData");
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";
  if (
    !student ||
    student["email"] !== adminEmail ||
    student["password"] !== adminPassword
  ) {
    window.location.href = "login.html";
    return;
  }
  fetchLessons();
});

function addCourse() {
  const title = document.getElementById("course-title").value;
  const category = document.getElementById("course-category").value;
  const instructor = document.getElementById("instructor-name").value;
  const description = document.getElementById("course-desc").value;
  const price = document.getElementById("course-price").value;
  const duration = document.getElementById("course-duration").value;
  const image = document.getElementById("course-image").value;

  if (
    !title ||
    !category ||
    !instructor ||
    !description ||
    !price ||
    !duration ||
    duration <= 0 ||
    price <= 0 ||
    !image
  ) {
    alert(
      "Please fill all fields! Price and duration must be positive values."
    );
    return;
  }

  const coursesRef = database.ref("courses");

  coursesRef
    .orderByChild("title")
    .equalTo(title)
    .once("value", (snapshot) => {
      if (snapshot.exists()) {
        alert("Course with this title already exists!");
        return;
      }

      const newCourse = {
        title,
        category,
        instructor,
        description,
        price,
        duration,
        image,
      };

      const newCourseRef = coursesRef.push();
      newCourse.id = newCourseRef.key;

      newCourseRef
        .set(newCourse)
        .then(() => {
          alert("Course added successfully!");
          closeForm("courseForm");
          fetchCourses();
        })
        .catch((error) => {
          alert("Error adding course: " + error.message);
        });
    });
}

function fetchCourses() {
  const coursesRef = database.ref("courses");
  coursesRef.on("value", (snapshot) => {
    const courses = snapshot.val();
    const tbody = document.querySelector("#courses tbody");
    tbody.innerHTML = "";

    if (courses) {
      Object.keys(courses).forEach((key) => {
        const course = courses[key];
        const row = `
                  <tr>
                      <td>${course.title}</td>
                      <td>${course.instructor}</td>
                      <td>${course.category}</td>
                      <td>${course.price}</td>
                      <td>${course.duration}</td>
                      <td>
                          <button class="edit" onclick="editCourse('${key}')">Edit</button>
                          <button class="delete" onclick="deleteCourse('${key}')">Delete</button>
                      </td>
                  </tr>
              `;
        tbody.innerHTML += row;
      });
    }
  });
}

function editCourse(courseId) {
  const courseRef = database.ref(`courses/${courseId}`);

  courseRef.once("value", (snapshot) => {
    const course = snapshot.val();

    const categorySelect = document.getElementById("edit-course-category");
    categorySelect.innerHTML = "";

    const categoriesRef = database.ref("categories");
    categoriesRef.once("value", (snapshot) => {
      const categories = snapshot.val();
      if (categories) {
        Object.keys(categories).forEach((key) => {
          const option = document.createElement("option");
          option.value = categories[key].name;
          option.textContent = categories[key].name;
          if (categories[key].name === course.category) {
            option.selected = true;
          }
          categorySelect.appendChild(option);
        });
      }

      document.getElementById("edit-course-title").value = course.title;
      document.getElementById("edit-instructor-name").value = course.instructor;
      document.getElementById("edit-course-desc").value = course.description;
      document.getElementById("edit-course-price").value = course.price;
      document.getElementById("edit-course-duration").value = course.duration;

      openForm("editCourseForm");
    });

    document.querySelector("#editCourseForm .submit-btn").onclick = () => {
      const updatedCourse = {
        title: document.getElementById("edit-course-title").value,
        category: document.getElementById("edit-course-category").value,
        instructor: document.getElementById("edit-instructor-name").value,
        description: document.getElementById("edit-course-desc").value,
        price: document.getElementById("edit-course-price").value,
        duration: document.getElementById("edit-course-duration").value,
      };

      courseRef
        .update(updatedCourse)
        .then(() => {
          alert("Course updated successfully!");
          closeForm("editCourseForm");
          fetchCourses();
        })
        .catch((error) => {
          alert("Error updating course: " + error.message);
        });
    };
  });
}

function deleteCourse(courseId) {
  if (confirm("Are you sure you want to delete this course?")) {
    const courseRef = database.ref(`courses/${courseId}`);
    courseRef
      .remove()
      .then(() => {
        alert("Course deleted successfully!");
        fetchCourses();
      })
      .catch((error) => {
        alert("Error deleting course: " + error.message);
      });
  }
}

function addCategory() {
  const categoryName = document.getElementById("category-name").value;

  if (!categoryName) {
    alert("Please enter a category name!");
    return;
  }

  const categoriesRef = database.ref("categories");
  categoriesRef
    .push({ name: categoryName })
    .then(() => {
      alert("Category added successfully!");
      closeForm("categoryForm");
      fetchCategories();
    })
    .catch((error) => {
      alert("Error adding category: " + error.message);
    });
}

function fetchCategories() {
  const categoriesRef = database.ref("categories");
  categoriesRef.on("value", (snapshot) => {
    const categories = snapshot.val();
    const categorySelect = document.getElementById("course-category");
    const tbody = document.querySelector("#categories tbody");
    tbody.innerHTML = "";

    categorySelect.innerHTML = "";

    if (categories) {
      Object.keys(categories).forEach((key) => {
        const category = categories[key];
        const option = document.createElement("option");
        option.value = category.name;
        option.textContent = category.name;
        categorySelect.appendChild(option);

        const row = `
                  <tr>
                      <td>${category.name}</td>
                      <td>
                          <button class="edit" onclick="editCategory('${key}')">Edit</button>
                          <button class="delete" onclick="deleteCategory('${key}')">Delete</button>
                      </td>
                  </tr>
              `;
        tbody.innerHTML += row;
      });
    }
  });
}

function editCategory(categoryId) {
  const categoryRef = database.ref(`categories/${categoryId}`);
  categoryRef.once("value", (snapshot) => {
    const category = snapshot.val();
    document.getElementById("edit-category-name").value = category.name;

    openForm("editCategoryForm");

    document.querySelector("#editCategoryForm .submit-btn").onclick = () => {
      const updatedCategory = {
        name: document.getElementById("edit-category-name").value,
      };

      categoryRef
        .update(updatedCategory)
        .then(() => {
          const coursesRef = database.ref("courses");
          coursesRef.once("value", (snapshot) => {
            const courses = snapshot.val();
            if (courses) {
              Object.keys(courses).forEach((key) => {
                if (courses[key].category === category.name) {
                  coursesRef
                    .child(key)
                    .update({ category: updatedCategory.name });
                }
              });
            }
          });

          alert("Category updated successfully!");
          closeForm("editCategoryForm");
          fetchCategories();
        })
        .catch((error) => {
          alert("Error updating category: " + error.message);
        });
    };
  });
}

function deleteCategory(categoryId) {
  if (confirm("Are you sure you want to delete this category?")) {
    const categoryRef = database.ref(`categories/${categoryId}`);
    categoryRef.once("value", (snapshot) => {
      const category = snapshot.val();

      const coursesRef = database.ref("courses");
      coursesRef.once("value", (snapshot) => {
        const courses = snapshot.val();
        if (courses) {
          Object.keys(courses).forEach((key) => {
            if (courses[key].category === category.name) {
              coursesRef.child(key).remove();
            }
          });
        }
      });

      categoryRef
        .remove()
        .then(() => {
          alert("Category deleted successfully!");
          fetchCategories();
        })
        .catch((error) => {
          alert("Error deleting category: " + error.message);
        });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCourses();
  fetchCategories();
  loadPendingRequests();
});

function enrollStudent(studentId, courseId) {
  console.log("Received studentId:", studentId);
  console.log("Received courseId:", courseId);

  if (!studentId || !courseId) {
    console.error("Error: studentId or courseId is missing!");
    return;
  }

  try {
    const studentCourseRef = database.ref(
      `students-courses/${studentId}_${courseId}`
    );

    studentCourseRef
      .set({
        student_id: studentId,
        course_id: courseId,
        status: "pending",
        progress: 0,
      })
      .then(() => {
        console.log(
          `Student ${studentId} requested to enroll in course ${courseId}`
        );
        loadPendingRequests();
      })
      .catch((error) => {
        console.error("Error enrolling student:", error);
      });
  } catch (error) {
    console.error("Error enrolling student:", error);
  }
}

function loadPendingRequests() {
  const requestsTable = document.getElementById("requests-table-body");
  database
    .ref("students-courses")
    .orderByChild("status")
    .equalTo("pending")
    .once("value")
    .then((snapshot) => {
      console.log("Fetched pending requests:", snapshot.val());
      requestsTable.innerHTML = "";

      if (snapshot.exists()) {
        snapshot.forEach(async (childSnapshot) => {
          const data = childSnapshot.val();
          const courseData = await new Promise((resolve) => {
            fetchCourseById(data.course_id, (course) => {
              resolve(course);
            });
          });
          const row = `
                      <tr>
                          <td>${data.student_id}</td>
                          <td>${courseData.title}</td>
                          <td>${data.status}</td>
                          <td>${
                            data.payed
                              ? "student purchassed"
                              : "student will purchase "
                          }</td>
                          <td>
                              <button class="accept-btn" onclick="approveEnrollment('${
                                data.student_id
                              }', '${data.course_id}')">Accept</button>
                              <button class="reject-btn" onclick="rejectEnrollment('${
                                data.student_id
                              }', '${data.course_id}')">Reject</button>
                          </td>
                      </tr>
                  `;
          requestsTable.innerHTML += row;
        });
      } else {
        requestsTable.innerHTML =
          "<tr><td colspan='4'>No pending requests</td></tr>";
      }
    })
    .catch((error) => {
      console.error("Error fetching pending requests:", error);
    });
}

function approveEnrollment(studentId, courseId) {
  try {
    const studentCourseRef = database.ref(
      `students-courses/${studentId}_${courseId}`
    );
    console.log(
      `Approving enrollment for Student ID: ${studentId}, Course ID: ${courseId}`
    );

    studentCourseRef
      .update({
        status: "enrolled",
        progress: 0,
      })
      .then(() => {
        alert(`Student ${studentId} has been enrolled in course ${courseId}`);
        loadPendingRequests();
      })
      .catch((error) => {
        console.error("Error approving enrollment:", error);
      });
  } catch (error) {
    console.error("Error approving enrollment:", error);
  }
}

function rejectEnrollment(studentId, courseId) {
  try {
    const studentCourseRef = database.ref(
      `students-courses/${studentId}_${courseId}`
    );
    console.log(
      `Rejecting enrollment for Student ID: ${studentId}, Course ID: ${courseId}`
    );

    studentCourseRef
      .remove()
      .then(() => {
        alert(`Enrollment request for student ${studentId} has been removed.`);
        loadPendingRequests();
      })
      .catch((error) => {
        console.error("Error rejecting enrollment:", error);
      });
  } catch (error) {
    console.error("Error rejecting enrollment:", error);
  }
}

function updateStudentProgress(studentId, courseId, progress) {
  const studentCourseRef = database.ref(
    `students-courses/${studentId}_${courseId}`
  );
  console.log(
    `Updating progress for Student ID: ${studentId}, Course ID: ${courseId}, Progress: ${progress}%`
  );

  studentCourseRef
    .update({
      progress: progress,
    })
    .then(() => {
      console.log(
        `Progress updated for student ${studentId} in course ${courseId}`
      );
    })
    .catch((error) => {
      console.error("Error updating progress:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, fetching data...");
  fetchCourses();
  fetchCategories();
  if (typeof fetchStudentProgress === "function") {
    fetchStudentProgress();
  } else {
    console.error("Error: fetchStudentProgress is not defined!");
  }
});

async function fetchStudentProgress() {
  const progressTable = document.getElementById("progressTableBody");
  progressTable.innerHTML = "";

  try {
    const snapshot = await database.ref("students-courses").once("value");
    const data = snapshot.val();
    let hasApprovedStudents = false;

    if (data) {
      for (const key of Object.keys(data)) {
        const { progress, status } = data[key];
        const [studentId, courseId] = key.split("_");

        const studentFullData = await new Promise((resolve) => {
          fetchUserById(studentId, (user) => {
            resolve(user);
          });
        });

        const courseFullData = await new Promise((resolve) => {
          fetchCourseById(courseId, (course) => {
            resolve(course);
          });
        });

        if (status === "enrolled") {
          hasApprovedStudents = true;
          const alldata = await getStudentCourseData(studentId, courseId);

          const rating = alldata?.review?.rating || 0;
          const comment = alldata?.review?.comment || "No comments";

          const starIcons = generateStars(rating);
          console.log(studentId);
          console.log(studentFullData);

          const row = `
            <tr>
              <td>${studentFullData?.email || studentId}</td>
              <td>${courseFullData?.title || "Untitled Course"}</td>
              <td>
                <div style="position: relative; width: 100px; background: #eee; border-radius: 5px;">
                  <div style="width: ${progress}%; background: green; height: 10px; border-radius: 5px;"></div>
                  <span style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); font-size: 12px;">
                    ${progress}%
                  </span>
                </div>
              </td>
              <td style="color:#ffc107;">${starIcons}</td>
              <td>${comment}</td>
            </tr>
          `;

          progressTable.innerHTML += row;
        }
      }
    }

    if (!hasApprovedStudents) {
      progressTable.innerHTML = `<tr><td colspan="5">No enrolled students yet.</td></tr>`;
    }
  } catch (error) {
    console.error("Error fetching student progress:", error);
  }
}

function generateStars(rating) {
  const filledStar = "★";
  const emptyStar = "☆";
  return filledStar.repeat(rating) + emptyStar.repeat(5 - rating);
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCourses();
  fetchCategories();
});
function logout() {
  Storage.removeLocalData("userData");
}
