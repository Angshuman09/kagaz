'use client'
import { EditorExtension } from './Editor-extension'
import { useEditor, EditorContent } from '@tiptap/react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import { Editor } from '@tiptap/react'

interface EditorExtensionProps {
    editor: Editor | null
}

export const TextEditor = ({editor}: EditorExtensionProps) => {

    const { fileId } = useParams();
    const getNotes = useQuery(api.notes.getNotes, fileId ? { fileId: fileId as string } : "skip");

    

    useEffect(() => {
        if (getNotes) {
            editor && editor.commands.setContent(getNotes[0]?.note);
        }
    }, [getNotes && editor])

    if (!editor) {
        return null
    }

    return (
        <div className='border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full'>
            {/* Toolbar */}
            <div className="shrink-0 z-10 sticky top-0 bg-white">
                <EditorExtension editor={editor} />
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    )
}