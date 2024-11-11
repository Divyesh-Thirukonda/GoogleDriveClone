import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Auth from './Auth';
import DocumentList from './DocumentList';
import DocumentEditor from './DocumentEditor';

const socket = io('http://localhost:5000');

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [documents, setDocuments] = useState([]);
    const [currentDoc, setCurrentDoc] = useState(null);
    const [content, setContent] = useState('');

    useEffect(() => {
        if (token) {
            fetchDocuments();
        }
    }, [token]);

    const fetchDocuments = async () => {
        try {
            const res = await axios.get('/documents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const res = await axios.post('/login', { username, password });
            const userToken = res.data.token;
            setToken(userToken);
            localStorage.setItem('token', userToken);
            fetchDocuments();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = () => {
        setToken(null);
        localStorage.removeItem('token');
        setDocuments([]);
        setCurrentDoc(null);
    };

    const handleDocumentSelect = (doc) => {
        setCurrentDoc(doc);
        setContent(doc.content);
        socket.emit('join-document', doc._id);
    };

    const handleContentChange = (newContent) => {
        setContent(newContent);
        socket.emit('edit-document', currentDoc._id, newContent);
    };

    useEffect(() => {
        if (currentDoc) {
            socket.on('document-updated', (newContent) => {
                setContent(newContent);
            });
        }
        return () => socket.off('document-updated');
    }, [currentDoc]);

    return (
        <div>
            {!token ? (
                <Auth onLogin={handleLogin} />
            ) : (
                <div>
                    <button onClick={handleLogout}>Logout</button>
                    <h2>Documents</h2>
                    <DocumentList documents={documents} onSelect={handleDocumentSelect} />
                    {currentDoc && (
                        <DocumentEditor
                            title={currentDoc.title}
                            content={content}
                            onChangeContent={handleContentChange}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
