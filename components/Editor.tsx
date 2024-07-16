import React from "react"
import ReactMde from "react-mde"
import Showdown from "showdown"

export default function Editor({ currentNote, updateNote }): React.JSX.Element {
    const [selectedTab, setSelectedTab]: [selectedTab: string, setSelectedTab: any]  = React.useState("write")

    const converter: Showdown.Converter = new Showdown.Converter({
        tables: true,
        simplifiedAutoLink: true,
        strikethrough: true,
        tasklists: true,
    })  

    return (
        <section className="pane editor">
            <ReactMde
                value={currentNote.body}
                onChange={updateNote}
                selectedTab={selectedTab}
                onTabChange={setSelectedTab}
                generateMarkdownPreview={(markdown) =>
                    Promise.resolve(converter.makeHtml(markdown))
                }
                minEditorHeight={80}
                heightUnits="vh"
            />
        </section>
    )
}
