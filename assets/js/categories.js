// Fetch all categories
function fetchCategories(callback) {
  const categoriesRef = database.ref("categories");
  categoriesRef.on("value", (snapshot) => {
    const categories = snapshot.val();
    callback(categories);
  });
}

// Add a new category
function addCategory(categoryData, onSuccess, onError) {
  const categoriesRef = database.ref("categories");
  categoriesRef
    .push(categoryData)
    .then(() => onSuccess())
    .catch((error) => onError(error.message));
}

// Update a category
function updateCategory(categoryId, updatedData, onSuccess, onError) {
  const categoryRef = database.ref(`categories/${categoryId}`);
  categoryRef
    .update(updatedData)
    .then(() => onSuccess())
    .catch((error) => onError(error.message));
}

// Delete a category
function deleteCategory(categoryId, onSuccess, onError) {
  const categoryRef = database.ref(`categories/${categoryId}`);
  categoryRef
    .remove()
    .then(() => onSuccess())
    .catch((error) => onError(error.message));
}
