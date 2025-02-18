// Function to toggle Read More
function toggleReadMore() {
  const readMoreElements = document.querySelectorAll(".read-more");
  const button = document.querySelector(".read-more-button");

  readMoreElements.forEach((element) => {
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "list-item";
      button.textContent = "Read Less";
    } else {
      element.style.display = "none";
      button.textContent = "Read More";
    }
  });
}

// Function to hide aside when it reaches the footer
window.addEventListener("scroll", () => {
  const aside = document.getElementById("aside");
  const footer = document.getElementById("footer");
  const footerTop = footer.getBoundingClientRect().top;

  if (footerTop < window.innerHeight) {
    aside.classList.add("aside-hidden");
  } else {
    aside.classList.remove("aside-hidden");
  }
});

// Function to handle Add to Card
document.getElementById("add-to-card").addEventListener("click", () => {
  // Save course details to localStorage
  const course = {
    title: "The Complete AI-Powered Copywriting Course & ChatGPT Course",
    price: "E2249.99",
    discount: "E4,099.99",
    image: "./assets/images/80579746_8e0c_2 (1).jpg",
  };
  localStorage.setItem("cart", JSON.stringify(course));

  // Redirect to lessons page
  window.location.href = "lesson.html";
});

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get("id");

  if (!courseId) {
    console.error("Course ID not found in URL!");
    return;
  }


  // Display course data in the HTML
  function displayCourseData(course) {
    // Update the hero section
    document.querySelector(".hero-content h1").textContent = course.title;
    document.querySelector(".hero-content h4").textContent = course.description;
    document.querySelector(".hero-content .rating").textContent =
      course.rating || "★★★★☆ 4.4";
    document.querySelector(".hero-content .students").textContent = `${
      course.students || "12,421"
    } students`;

    // Update the pricing section
    document.querySelector(".pricing .price").textContent = `$${
      course.price || "2249.99"
    }`;
    document.querySelector(".pricing .discount").textContent = `$${
      course.discount || "4099.99"
    } <span>77% off</span>`;

    // Update the "What You'll Learn" section
    const whatYouLearn = document.querySelector(".what-you-learn .text");
    whatYouLearn.innerHTML = course.learningPoints
      .map((point) => `<p><i class="fa-solid fa-check"></i>${point}</p>`)
      .join("");

    // Update the "Course Includes" section
    const courseIncludes = document.querySelector(".course-includes .courses");
    courseIncludes.innerHTML = `
      <p><i class="fa-brands fa-youtube"></i>${
        course.videoHours || "26.5"
      } hours on-demand video</p>
      <p><i class="fa-solid fa-question"></i>${
        course.practiceTests || "1"
      } practice test</p>
      <p><i class="fa-solid fa-sheet-plastic"></i>Assignments</p>
      <p><i class="fa-solid fa-file"></i>${course.articles || "1"} article</p>
      <p><i class="fa-solid fa-download"></i>${
        course.downloadableResources || "193"
      } downloadable resources</p>
      <p><i class="fa-solid fa-mobile"></i>Access on mobile and TV</p>
      <p><i class="fa-solid fa-certificate"></i>Certificate of completion</p>
    `;

    // Update the "Requirements" section
    const requirementsList = document.querySelector("#requirements-list");
    requirementsList.innerHTML = course.requirements
      .map((requirement) => `<li>${requirement}</li>`)
      .join("");

    // Update the "Description" section
    document.querySelector(".description p").textContent = course.description;

    // Update the instructor section
    const instructorSection = document.querySelector(
      ".learn-digital-advertising .content"
    );
    instructorSection.querySelector("h1").textContent =
      course.instructor || "Learn Digital Advertising";
    instructorSection.querySelector(".subtitle").textContent =
      course.subtitle ||
      "ChatGPT, Gemini AI, Copywriting, Google Ads, Meta Ads, SEO";
    instructorSection.querySelector(".image img").src =
      course.instructorImage || "./assets/images/80579746_8e0c_2 (1).jpg";
    instructorSection.querySelector(".text p:nth-child(1)").textContent = `${
      course.instructorRating || "4.4"
    } Instructor Rating`;
    instructorSection.querySelector(".text p:nth-child(2)").textContent = `${
      course.reviews || "35,637"
    } Reviews`;
    instructorSection.querySelector(".text p:nth-child(3)").textContent = `${
      course.students || "1,048,090"
    } Students`;
    instructorSection.querySelector(".text p:nth-child(4)").textContent = `${
      course.coursesCount || "62"
    } Courses`;
    instructorSection.querySelector(".desc").textContent =
      course.instructorDescription || "Welcome to Learn Digital Advertising...";
  }

  // Fetch and display the course data
    fetchCourseById(courseId, (course) => {
    displayCourseData(course);
  });

  // Handle "Add to Cart" button click
  document.getElementById("add-to-card").addEventListener("click", function () {
    const student = Storage.fetchLocalData("userData");
    if (!student) {
      alert("Please log in to add courses to your cart.");
      return;
    }

    const studentId = student["uid"];
    addToCart(
      studentId,
      courseId,
      () => {
        alert("Course added to cart!");
      },
      (error) => {
        alert("Error adding course to cart: " + error);
      }
    );
  });
});
