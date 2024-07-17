import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid" // no longer in use
import { onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore"
import { notesCollection, db } from "./firebase.tsx"

export default function App(): React.JSX.Element {
    const [notes, setNotes]: [notes: any, setNotes: any] = React.useState( () => JSON.parse(localStorage.getItem("notes")!) || [] )
    const [currentNoteId, setCurrentNoteId]: [currentNoteId: number, setCurrentNodeId: any] = React.useState(
        (notes[0] && notes[0].id) || ""
    )

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

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

    // React.useEffect(() => {
    //     localStorage.setItem("notes", JSON.stringify(notes))
    // }, [notes])

    


    async function createNewNote(): Promise<void> {
        /*
            Create a new note in the Firestore database.  The Note ID will be created by the database. 
            Wait for the database to create the new note, then proceed.
        */
        const newNote: {body: string} = {
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
    
    function updateNote(text: string): any[] {
        /* 
            When the notes are updated, if the note being updated in not the first in the list of notes, it will be moved
            to the first position.  The updatedArr will be the new order of the notes.
        */
        const updatedArr: any[] = []
        setNotes(oldNotes => {
            for (let i = 0; i < oldNotes.length; i++) {
                const currentNote: {id: number, note: string} = oldNotes[i]
                if (currentNote.id === currentNoteId) {
                    updatedArr.unshift({...currentNote, body: text});
                }
                else {
                    updatedArr.push(currentNote);
                }
            }
        })

        return updatedArr;
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
                    notes={notes}
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
