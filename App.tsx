import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import {nanoid} from "nanoid"
import { onSnapshot } from "firebase/firestore"
import {notesCollection} from "./firebase.tsx"

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

    


    function createNewNote(): void {
        const newNote: {id: string, body: string} = {
            id: nanoid(),
            body: "# Title"
        }
        setNotes(prevNotes => [newNote, ...prevNotes])
        setCurrentNoteId(newNote.id)
    }

    function deleteNote(event, noteId): void {
        /*
            Event received from Sidebar component.  We know the note's ID from user input on the Sidebar when trash-icon is clicked.
            Only keep the notes that DO NOT have that clicked on note's ID; filter out the note with the matching ID.
        */
        event.stopPropagation();
        setNotes(oldNotes => oldNotes.filter((note) => note.id !== noteId));
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
