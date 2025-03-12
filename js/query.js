async function initializeDatabase() {
  // Load SQL.js library
  const SQL = await initSqlJs({
    locateFile: (file) => `/js/${file}`, // Path to SQL.js WebAssembly file
  });

  // Fetch the SQLite database file
  const databaseResponse = await fetch('/db/memes.db');
  const databaseBuffer = await databaseResponse.arrayBuffer();

  // Initialize the SQLite database
  const database = new SQL.Database(new Uint8Array(databaseBuffer));

  // Get the user's search input
  const userInput = document.getElementById('query-input').value;

  // Construct the SQL query to search for descriptions containing the user's input
  const searchQuery = `
    SELECT * 
    FROM images_texts 
    WHERE description LIKE "%${userInput}%"
  `;

  try {
    // Execute the query and get the results
    const queryResults = database.exec(searchQuery);
    displayImages(queryResults); // Display only the images
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

function displayImages(results) {
  const resultsContainer = document.getElementById('query-output');
  resultsContainer.innerHTML = ''; // Clear previous results

  results.forEach((resultSet) => {
    // Loop through each row of the result set
    resultSet.values.forEach((rowData) => {
      // Get the BLOB data from the second column (index 1)
      const imageBlobData = rowData[2];

      // Create a Blob object from the BLOB data
      const imageBlob = new Blob([imageBlobData], { type: 'image/jpeg' }); // Adjust MIME type if needed

      // Generate a URL for the Blob
      const imageUrl = URL.createObjectURL(imageBlob);

      // Create an image element
      const imageElement = document.createElement('img');
      imageElement.src = imageUrl;
      imageElement.alt = 'Image from database';
      imageElement.style.maxWidth = '100%'; // Adjust image size as needed

      // Append the image to the results container
      resultsContainer.appendChild(imageElement);
    });
  });
}

// Add an event listener to the search form
document.getElementById('query-form').addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from submitting
  initializeDatabase(); // Initialize the database and perform the search
});