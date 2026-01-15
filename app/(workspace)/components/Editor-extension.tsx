import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Highlighter,
    Sparkle,
} from 'lucide-react'

// Explicitly import extensions to ensure Typescript picks up the command augmentations
import '@tiptap/extension-highlight'
import '@tiptap/extension-underline'
import '@tiptap/extension-text-align'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api.js'
import { useParams } from 'next/navigation'

interface EditorExtensionProps {
    editor: Editor | null
}

export const EditorExtension = ({ editor }: EditorExtensionProps) => {
    const [isActive, setIsActive] = useState(false)

    const SearchAI = useAction(api.myAction.search)
    const { fileId } = useParams();

    useEffect(() => {
        if (!editor) return

        const updateActiveState = () => {
            setIsActive(prev => !prev) // Toggle to force re-render
        }

        editor.on('update', updateActiveState)
        editor.on('selectionUpdate', updateActiveState)

        return () => {
            editor.off('update', updateActiveState)
            editor.off('selectionUpdate', updateActiveState)
        }
    }, [editor])

    if (!editor) {
        return null
    }

    const onAiClick = async () => {

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        )

        if (!selectedText) return;

        console.log(selectedText)

        console.log(fileId)

        const result = await SearchAI({
            query: selectedText,
            fileId: fileId as string
        })

        console.log('unformatted answer', result)
    }

    return (
        <div className='border-b border-gray-200 bg-white px-4 py-2 flex items-center gap-4 flex-wrap sticky top-0 z-50 rounded-t-xl shadow-sm'>

            {/* Group: Headings */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    style={editor.isActive('heading', { level: 1 }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('heading', { level: 1 })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" style={{ color: editor.isActive('heading', { level: 1 }) ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    style={editor.isActive('heading', { level: 2 }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('heading', { level: 2 })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" style={{ color: editor.isActive('heading', { level: 2 }) ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    style={editor.isActive('heading', { level: 3 }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('heading', { level: 3 })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" style={{ color: editor.isActive('heading', { level: 3 }) ? '#000000' : undefined }} />
                </button>
            </div>

            {/* Group: Formatting */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    style={editor.isActive('bold') ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('bold')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" style={{ color: editor.isActive('bold') ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    style={editor.isActive('italic') ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('italic')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" style={{ color: editor.isActive('italic') ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    style={editor.isActive('underline') ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('underline')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Underline"
                >
                    <UnderlineIcon className="w-4 h-4" style={{ color: editor.isActive('underline') ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    style={editor.isActive('highlight') ? { backgroundColor: '#ffffff', color: '#d97706', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('highlight')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Highlight"
                >
                    <Highlighter className="w-4 h-4" style={{ color: editor.isActive('highlight') ? '#d97706' : undefined }} />
                </button>
            </div>

            {/* Group: Alignment */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    style={editor.isActive({ textAlign: 'left' }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive({ textAlign: 'left' })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" style={{ color: editor.isActive({ textAlign: 'left' }) ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    style={editor.isActive({ textAlign: 'center' }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive({ textAlign: 'center' })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" style={{ color: editor.isActive({ textAlign: 'center' }) ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    style={editor.isActive({ textAlign: 'right' }) ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive({ textAlign: 'right' })
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" style={{ color: editor.isActive({ textAlign: 'right' }) ? '#000000' : undefined }} />
                </button>
            </div>

            {/* Group: Lists */}
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    style={editor.isActive('bulletList') ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('bulletList')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" style={{ color: editor.isActive('bulletList') ? '#000000' : undefined }} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    style={editor.isActive('orderedList') ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' } : {}}
                    className={`p-1.5 rounded transition-all duration-200 ${editor.isActive('orderedList')
                        ? 'border border-gray-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-sm'
                        }`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" style={{ color: editor.isActive('orderedList') ? '#000000' : undefined }} />
                </button>
            </div>

            <button
                onClick={() => onAiClick()}
            >
                <Sparkle className="text-amber-400 hover:text-amber-500 rounded transition-all duration-200" />
            </button>
        </div>
    )
}