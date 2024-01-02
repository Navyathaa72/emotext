import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ViewSavedPage() {
  const [savedData, setSavedData] = useState([]);

  useEffect(() => {
    // Fetch data from the backend API and update the state
    fetch("http://127.0.0.1:8000/api/text/")
      .then((response) => response.json())
      .then((data) => setSavedData(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="container">
      <h1 className="page-title">View Saved Files</h1>
      {/* List of saved files */}
      {savedData.map((file) => (
        <div className="file-link-container" key={file.id}>
          <Link
            to={`/view/${file.id}`}
            className="file-link"
          >
            {file.name || file.content.slice(0, 25)}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default ViewSavedPage;
