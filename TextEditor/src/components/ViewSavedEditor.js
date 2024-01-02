import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TextEditor from "./TextEditor";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function ViewSavedEditor() {
  const { id } = useParams();

  console.log("ViewSavedEditor rendered");
  console.log("ID parameter:", id);

  const [selectedContent, setSelectedContent] = useState("");

  useEffect(() => {
    console.log("Fetching data...");
    fetch(`http://127.0.0.1:8000/api/text/${id}/`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched:", data);
        setSelectedContent(data.content);
      })
      .catch((error) => console.log(error));
  }, [id]);

  return (
    <div>
      {/* Render the TextEditor component with the retrieved content */}
      <TextEditor initialContent={selectedContent} />
    </div>
  );
}

export default ViewSavedEditor;
