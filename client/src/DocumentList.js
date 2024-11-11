import React from 'react';

function DocumentList({ documents, onSelect }) {
    return (
        <div>
            <h3>Your Documents</h3>
            <ul>
                {documents.map((doc) => (
                    <li key={doc._id} onClick={() => onSelect(doc)}>
                        {doc.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DocumentList;
