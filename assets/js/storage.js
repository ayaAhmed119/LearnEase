const Storage = {
  // LocalStorage
  fetchLocalData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  removeLocalData(key) {
    localStorage.removeItem(key);
  },
  manageLocalSpecific(key, id, value, action) {
    const data = this.fetchLocalData(key) || [];
    return manageSpecific(data, id, value, action, (updatedData) =>
      this.saveLocalData(key, updatedData)
    );
  },

  // Session Storage
  fetchSessionData(key) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },
  saveSessionData(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
  },
  removeSessionData(key) {
    sessionStorage.removeItem(key);
  },
  manageSessionSpecific(key, id, value, action) {
    const data = this.fetchSessionData(key) || [];
    return manageSpecific(data, id, value, action, (updatedData) =>
      this.saveSessionData(key, updatedData)
    );
  },

  // Cookies
  fetchCookieData(key) {
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
    const cookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));
    if (cookie) {
      const value = cookie.split("=")[1];
      return JSON.parse(decodeURIComponent(value));
    }
    return null;
  },
  saveCookieData(key, data, expiresInDays = 7) {
    const date = new Date();
    date.setTime(date.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${key}=${encodeURIComponent(
      JSON.stringify(data)
    )};${expires};path=/`;
  },
  removeCookieData(key) {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },
  manageCookieSpecific(key, id, value, action) {
    const data = this.fetchCookieData(key) || [];
    return manageSpecific(data, id, value, action, (updatedData) =>
      this.saveCookieData(key, updatedData)
    );
  },
};

// callback function for managing specific objects
function manageSpecific(data, id, value, action, saveCallback) {
  switch (action) {
    case "read":
      return data.find((element) => element.id === id) || null;

    case "update":
      const indexToUpdate = data.findIndex((element) => element.id === id);
      if (indexToUpdate !== -1) {
        data[indexToUpdate] = { ...data[indexToUpdate], ...value };
        saveCallback(data);
        return data[indexToUpdate];
      }
      return null;

    case "delete":
      const indexToDelete = data.findIndex((element) => element.id === id);
      if (indexToDelete !== -1) {
        const deletedItem = data.splice(indexToDelete, 1);
        saveCallback(data);
        return deletedItem[0];
      }
      return null;

    case "create":
      data.push({ id, ...value });
      saveCallback(data);
      return data[data.length - 1];

    default:
      throw new Error(
        'Invalid action specified. Use "read", "update", "delete", or "create".'
      );
  }
}





























/**
 * Storage Object
 * 
 * The `Storage` object provides a simple interface for managing data in 
 * LocalStorage, Session Storage, and Cookies. It allows you to perform 
 * CRUD (Create, Read, Update, Delete) operations on data stored in 
 * these storage mechanisms. Each storage type has its own set of methods 
 * for fetching, saving, removing, and managing specific objects within 
 * arrays.
 * 
 * Usage:
 * 
 * 1. **LocalStorage Operations**
 * 
 * - **Fetch Data**: Retrieve data from LocalStorage.
 *   ```javascript
 *   const data = Storage.fetchLocalData('yourKey');
 *   ```
 * 
 * - **Save Data**: Save data to LocalStorage.
 *   ```javascript
 *   Storage.saveLocalData('yourKey', yourData);
 *   ```
 * 
 * - **Remove Data**: Remove data from LocalStorage.
 *   ```javascript
 *   Storage.removeLocalData('yourKey');
 *   ```
 * 
 * - **Manage Specific Objects**: Perform CRUD operations on specific 
 *   objects within an array stored in LocalStorage.
 *   ```javascript
 *   // Create a new object
 *   const newObject = Storage.manageLocalSpecific('yourKey', 'uniqueId', { name: 'John' }, 'create');
 *   
 *   // Read an object
 *   const existingObject = Storage.manageLocalSpecific('yourKey', 'uniqueId', null, 'read');
 *   
 *   // Update an object
 *   const updatedObject = Storage.manageLocalSpecific('yourKey', 'uniqueId', { age: 30 }, 'update');
 *   
 *   // Delete an object
 *   const deletedObject = Storage.manageLocalSpecific('yourKey', 'uniqueId', null, 'delete');
 *   ```
 * 
 * 2. **Session Storage Operations**
 * 
 * - **Fetch Data**: Retrieve data from Session Storage.
 *   ```javascript
 *   const sessionData = Storage.fetchSessionData('yourKey');
 *   ```
 * 
 * - **Save Data**: Save data to Session Storage.
 *   ```javascript
 *   Storage.saveSessionData('yourKey', yourData);
 *   ```
 * 
 * - **Remove Data**: Remove data from Session Storage.
 *   ```javascript
 *   Storage.removeSessionData('yourKey');
 *   ```
 * 
 * - **Manage Specific Objects**: Perform CRUD operations on specific 
 *   objects within an array stored in Session Storage.
 *   ```javascript
 *   // Similar usage as LocalStorage
 *   ```
 * 
 * 3. **Cookie Operations**
 * 
 * - **Fetch Data**: Retrieve data from Cookies.
 *   ```javascript
 *   const cookieData = Storage.fetchCookieData('yourKey');
 *   ```
 * 
 * - **Save Data**: Save data to Cookies with an optional expiration time.
 *   ```javascript
 *   Storage.saveCookieData('yourKey', yourData, 7); // Expires in 7 days
 *   ```
 * 
 * - **Remove Data**: Remove data from Cookies.
 *   ```javascript
 *   Storage.removeCookieData('yourKey');
 *   ```
 * 
 * - **Manage Specific Objects**: Perform CRUD operations on specific 
 *   objects within an array stored in Cookies.
 *   ```javascript
 *   // Similar usage as LocalStorage
 *   ```
 * 
 * Error Handling:
 * 
 * - If an invalid action is specified in the `manageLocalSpecific`, 
 *   `manageSessionSpecific`, or `manageCookieSpecific` methods, an 
 *   error will be thrown. Valid actions are "read", "update", "delete", 
 *   and "create".
 * 
 * Note:
 * 
 * - The data is stored as JSON strings in LocalStorage, Session Storage, 
 *   and Cookies. Ensure that the data you save can be serialized to JSON.
 * - The `id` parameter in the management functions should be unique for 
 *   each object to ensure proper identification.
 */