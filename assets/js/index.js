document.addEventListener("DOMContentLoaded", function () {
  const coursesContainer = document.querySelector(".row");

  function renderCourses(courses) {
    coursesContainer.innerHTML = "";

    Object.values(courses || {}).forEach((course) => {
      const courseCard = `
        <div class="col-lg-4 mb-5">
          <div class="card border-0 bg-light shadow-sm pb-2">
            <img class="card-img-top mb-2" src="${
              course.image || "./assets/images/fakeimg.png"
            }" alt="${course.title}">
            <div class="card-body text-center">
              <h4 class="card-title">${course.title}</h4>
              <p class="card-text">${course.description}</p>
            </div>
            <div class="card-footer bg-transparent py-4 px-5">
              <div class="row border-bottom">
                <div class="col-6 py-1 text-right border-right"><strong>Category</strong></div>
                <div class="col-6 py-1">${course.category || "General"}</div>
              </div>
              <div class="row border-bottom">
                <div class="col-6 py-1 text-right border-right"><strong>Instructor</strong></div>
                <div class="col-6 py-1">${course.instructor || "Unknown"}</div>
              </div>
              <div class="row border-bottom">
                <div class="col-6 py-1 text-right border-right"><strong>Duration</strong></div>
                <div class="col-6 py-1">${course.duration || "N/A"} hours</div>
              </div>
              <div class="row">
                <div class="col-6 py-1 text-right border-right"><strong>Price</strong></div>
                <div class="col-6 py-1">$${course.price || "Free"}</div>
              </div>
            </div>
            <a href="./login.html" class="btn btn-primary px-4 mx-auto mb-4" >Join Now</a>
          </div>
        </div>
      `;
      coursesContainer.innerHTML += courseCard;
    });
  }
  fetchCourses(renderCourses);
});
