function fetchCourses(callback) {
  try {
    const coursesRef = database.ref("courses");
    coursesRef.on("value", (snapshot) => {
      const courses = snapshot.val();
      callback(courses);
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

function fetchCourseById(courseId, callback) {
  try {
    const courseRef = database.ref(`courses/${courseId}`);
    courseRef.once("value", (snapshot) => {
      const course = snapshot.val();
      callback(course);
    });
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
}

function addCourse(courseData, onSuccess, onError) {
  try {
    const coursesRef = database.ref("courses");
    coursesRef
      .orderByChild("title")
      .equalTo(courseData.title)
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          onError("Course with this title already exists!");
        } else {
          coursesRef
            .push(courseData)
            .then(() => onSuccess())
            .catch((error) => onError(error.message));
        }
      });
  } catch (error) {
    console.error("Error adding course:", error);
    throw error;
  }
}

function updateCourse(courseId, updatedData, onSuccess, onError) {
  try {
    const courseRef = database.ref(`courses/${courseId}`);
    courseRef
      .update(updatedData)
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

function deleteCourse(courseId, onSuccess, onError) {
  try {
    const courseRef = database.ref(`courses/${courseId}`);
    courseRef
      .remove()
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}

function fetchCategories(callback) {
  try {
    const categoriesRef = database.ref("categories");
    categoriesRef.on("value", (snapshot) => {
      const categories = snapshot.val();
      callback(categories);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

function addCategory(categoryData, onSuccess, onError) {
  try {
    const categoriesRef = database.ref("categories");
    categoriesRef
      .push(categoryData)
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
}

function updateCategory(categoryId, updatedData, onSuccess, onError) {
  try {
    const categoryRef = database.ref(`categories/${categoryId}`);
    categoryRef
      .update(updatedData)
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
}

function deleteCategory(categoryId, onSuccess, onError) {
  try {
    const categoryRef = database.ref(`categories/${categoryId}`);
    categoryRef
      .remove()
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}

function addLesson(courseId, lessonData, onSuccess, onError) {
  try {
    const lessonsRef = database.ref(`courses/${courseId}/lessons`);
    lessonsRef
      .push(lessonData)
      .then(() => onSuccess())
      .catch((error) => onError(error.message));
  } catch (error) {
    console.error("Error adding lesson:", error);
    throw error;
  }
}

async function checkEnrollmentStatus(studentId, courseId) {
  return new Promise((resolve, reject) => {
    const studentCourseRef = database.ref(
      `students-courses/${studentId}_${courseId}`
    );
    studentCourseRef
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val().status);
        } else {
          resolve(null);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function enrollStudent(studentId, courseId) {
  try {
    const enrollmentStatus = await checkEnrollmentStatus(studentId, courseId);

    if (enrollmentStatus === "enrolled") {
      alert("You are already enrolled in this course!");
      return;
    }

    fetchLessons(courseId, (lessons) => {
      if (!lessons) {
        console.error("No lessons found for this course!");
        return;
      }

      const watched = {};
      Object.keys(lessons).forEach((lessonId) => {
        watched[lessonId] = false;
      });

      const studentCourseRef = database.ref(
        `students-courses/${studentId}_${courseId}`
      );

      studentCourseRef
        .set({
          student_id: studentId,
          course_id: courseId,
          status: "pending",
          progress: 0,
          payed: false,
          watched,
        })
        .then(() => {
          console.log(
            `Student ${studentId} requested to enroll in course ${courseId}`
          );
          alert("Enrollment request sent!");
          window.location.href = `payment.html?id=${courseId}`;
        })
        .catch((error) => {
          console.error("Error enrolling student:", error);
          alert("Error while enrolling. Please try again.");
        });
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    alert("Error while enrolling. Please try again.");
    throw error;
  }
}

// Update the event listener in addEventListenersToButtons

function getStudentCourseData(studentId, courseId) {
  return database
    .ref(`students-courses/${studentId}_${courseId}`)
    .once("value")
    .then((snapshot) => {
      if ( snapshot.exists() ) {
        console.log("Data retreved ");
        
        return snapshot.val();
      } else {
        console.log(
          `Student ${studentId} is not enrolled in course ${courseId}`
        );

        return null;
      }
    })
    .catch((error) => {
      console.error("Error fetching student course status:", error);
      throw error;
    });
}

function myCourses(studentId, callback) {
  try {
    const coursesRef = database.ref("students-courses");
    coursesRef
      .once("value", (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const enrolledCourses = [];
        const studentCourses = snapshot.val();

        for (let key in studentCourses) {
          const course = studentCourses[key];
          if (course.student_id === studentId && course.status === "enrolled") {
            enrolledCourses.push(course.course_id);
          }
        }

        if (enrolledCourses.length === 0) {
          callback([]);
          return;
        }

        const allCoursesRef = database.ref("courses");
        allCoursesRef.once("value", (courseSnapshot) => {
          if (!courseSnapshot.exists()) {
            callback([]);
            return;
          }

          const allCourses = courseSnapshot.val();
          const studentCoursesDetails = enrolledCourses
            .map((courseId) => allCourses[courseId])
            .filter((course) => course);

          callback(studentCoursesDetails);
        });
      })
      .catch((error) => {
        console.error("Error fetching myCourses:", error);
        callback([]);
      });
  } catch (error) {
    console.error("Error fetching myCourses:", error);
    throw error;
  }
}

function filterByCategory(category, callback) {
  try {
    const coursesRef = database.ref("courses");
    coursesRef
      .once("value", (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const filteredCourses = [];
        snapshot.forEach((childSnapshot) => {
          const course = childSnapshot.val();
          if (course.category === category) {
            filteredCourses.push(course);
          }
        });

        callback(filteredCourses);
      })
      .catch((error) => {
        console.error("Error filtering courses by category:", error);
        callback([]);
      });
  } catch (error) {
    console.error("Error filtering courses by category:", error);
    throw error;
  }
}

function filterByWord(word, callback) {
  try {
    const coursesRef = database.ref("courses");
    coursesRef
      .once("value", (snapshot) => {
        if (!snapshot.exists()) {
          callback([]);
          return;
        }

        const filteredCourses = [];
        snapshot.forEach((childSnapshot) => {
          const course = childSnapshot.val();
          if (
            course.title.toLowerCase().includes(word.toLowerCase()) ||
            course.description.toLowerCase().includes(word.toLowerCase())
          ) {
            filteredCourses.push(course);
          }
        });

        callback(filteredCourses);
      })
      .catch((error) => {
        console.error("Error filtering courses by word:", error);
        callback([]);
      });
  } catch (error) {
    console.error("Error filtering courses by word:", error);
    throw error;
  }
}

function currentCourse(courseId, callback) {
  try {
    const courseRef = database.ref("courses").child(courseId);
    courseRef
      .once("value", (snapshot) => {
        if (snapshot.exists()) {
          callback({ id: snapshot.key, ...snapshot.val() });
        } else {
          callback(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching course:", error);
        callback(null);
      });
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

function addToWishlist(courseId) {
  try {
    this.fetchCourseById(courseId, (course) => {
      if (!course) {
        throw new Error("Course not found!");
      }

      let wishlist = Storage.fetchLocalData("wishlist") || [];
      for (let i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === course.id) {
          throw new Error(
            `Course "${course.title}" is already in the wishlist.`
          );
        }
      }
      wishlist.push(course);
      Storage.saveLocalData("wishlist", wishlist);
      console.log(`Course "${course.title}" added to wishlist.`);
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
}

function fetchWishlist(callback) {
  try {
    const wishlist = Storage.fetchLocalData("wishlist") || [];
    callback(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
}

function removeFromWishlist(courseId) {
  try {
    this.fetchCourseById(courseId, (course) => {
      let wishlist = Storage.fetchLocalData("wishlist") || [];
      const courseIndex = wishlist.findIndex((item) => item.id === courseId);

      if (courseIndex !== -1) {
        wishlist.splice(courseIndex, 1);
        Storage.saveLocalData("wishlist", wishlist);
        console.log(`Course "${course.title}" removed from wishlist.`);
      } else {
        throw new Error(`Course "${course.title}" not found in wishlist.`);
      }
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
}

function fetchLessons(courseId, callback) {
  try {
    const lessonsRef = database.ref(`courses/${courseId}/lessons`);
    lessonsRef.once("value", (snapshot) => {
      const lessons = snapshot.val();
      if (lessons) {
        callback(lessons);
      } else {
        throw new Error("No lessons found for this course!");
      }
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    throw error;
  }
}
function fetchUserById(uid, callback) {
  try {
    const userRef = database.ref(`users/${uid}`);
    userRef.once("value", (snapshot) => {
      const user = snapshot.val();
      console.log(user);
      
      callback(user);
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}