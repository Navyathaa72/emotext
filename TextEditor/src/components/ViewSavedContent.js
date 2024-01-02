import React from "react";

function ViewSavedContent({ content }) {
  return (
    <div>
      <textarea
        value={content}
        onChange={() => {}}
        rows={10}
        cols={50}
        readOnly
      />
    </div>
  );
}

export default ViewSavedContent;
