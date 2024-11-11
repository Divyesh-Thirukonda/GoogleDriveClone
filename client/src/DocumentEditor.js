import React from 'react';

function DocumentEditor({ title, content, onChangeContent }) {
    const handleContentChange = (e) => {
        onChangeContent(e.target.value);
    };

    return (
        <div>
            <h3>Editing: {title}</h3>
            <textarea
                value={content}
                onChange={handleContentChange}
                style={{ width: '100%', height: '300px' }}
            />
        </div>
    );
}

export default DocumentEditor;
