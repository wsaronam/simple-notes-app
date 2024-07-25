import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid" // no longer in use
import { onSnapshot, addDoc, setDoc, deleteDoc, doc } from "firebase/firestore"
import { notesCollection, db } from "./firebase.tsx"




export default function App(): React.JSX.Element {
    const [notes, setNotes]: [notes: any, setNotes: any] = React.useState([])
    const [currentNoteId, setCurrentNoteId]: any = React.useState("")

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    // sort notes array by most recently updated
    const notesArrSortedByUpdatedAt: any[] = notes.sort((a, b) => b.updatedAt - a.updatedAt); 


    // Initialize Notes program with a snapshot of the Notes data from our Firebase db
    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot) {
            const notesArr = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setNotes(notesArr);
        })
        return unsubscribe
    }, [])

    // Set the current note to the first if there isn't a note selected
    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id);
        }
    }, [notes])

    // React.useEffect(() => {
    //     localStorage.setItem("notes", JSON.stringify(notes))
    // }, [notes])

    


    async function createNewNote(): Promise<void> {
        /*
            Create a new note in the Firestore database.  The Note ID will be created by the database. 
            Wait for the database to create the new note, then proceed.
        */
        const newNote: {createdAt: number, updatedAt: number, body: string} = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            body: "# Title"
        }
        const awaitNewDoc = await addDoc(notesCollection, newNote);
        setCurrentNoteId(awaitNewDoc.id);
    }

    async function deleteNote(noteId): Promise<void> {
        /*
            Event received from Sidebar component.  We know the note's ID from user input on the Sidebar when trash-icon is clicked.
            Create a reference to the note in the database with that id then delete it.
        */
        const docRef = doc(db, "notes", noteId);
        await deleteDoc(docRef);
    }
    
    async function updateNote(text: string): Promise<void> {
        /* 
            Using the currentNoteId, we update the note in the Firebase with what we have in our application.
        */
        const docRef = doc(db, "notes", currentNoteId);
        await setDoc(docRef, {updatedAt: Date.now(), body: text}, {merge: true});
    }
    



    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={notesArrSortedByUpdatedAt}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                {
                    currentNoteId && 
                    notes.length > 0 &&
                    <Editor 
                        currentNote={currentNote} 
                        updateNote={updateNote} 
                    />
                }
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}
