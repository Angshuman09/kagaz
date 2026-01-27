import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import {
    Bold,
    Italic,
    Underline,
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
import { getGeminiResponse } from '@/configs/AIModel'

// Explicitly import extensions to ensure Typescript picks up the command augmentations
import '@tiptap/extension-highlight'
import '@tiptap/extension-underline'
import '@tiptap/extension-text-align'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api.js'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

interface EditorExtensionProps {
    editor: Editor | null
}

export const EditorExtension = ({ editor }: EditorExtensionProps) => {
    const [isActive, setIsActive] = useState(false)
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const SearchAI = useAction(api.myAction.search)
    const addNotes = useMutation(api.notes.saveNote);
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
        setLoading(true);
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

        const PROMPT = `For this question ${selectedText}, the answer is ${result}. Please give the answer in HTML format with simple and easy to understand.`

        const formattedAnswer = await getGeminiResponse(PROMPT)

        const finalAnswer = formattedAnswer.replace('```html', '').replace('```', '')

        console.log('formatted answer', formattedAnswer)

        const AllText = editor.getHTML();

        editor.commands.setContent(AllText + '<p><strong>Answer: </strong>' + finalAnswer + '</p>');

        const Allnote = editor.getHTML();

        await addNotes({
            fileId: fileId as string,
            note: Allnote,
            createBy: user?.primaryEmailAddress?.emailAddress as string
        })
        setLoading(false);
    }

    return (
        <div className='bg-linear-to-b from-white to-gray-50/50 border-b border-gray-200/80 px-6 py-3 rounded-t-xl shadow-sm backdrop-blur-sm'>
            <div className="flex items-center gap-2 flex-wrap">

                {/* Unified Toolbar Group */}
                <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white rounded-lg border border-gray-200/60 shadow-sm">

                    {/* Headings */}
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('heading', { level: 1 })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('heading', { level: 2 })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('heading', { level: 3 })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Formatting */}
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('bold')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('italic')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('underline')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Underline"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('highlight')
                            ? 'bg-amber-50 text-amber-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Highlight"
                    >
                        <Highlighter className="w-4 h-4" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Alignment */}
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive({ textAlign: 'left' })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive({ textAlign: 'center' })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive({ textAlign: 'right' })
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 mx-1" />

                    {/* Lists */}
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('bulletList')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded-md transition-all duration-150 ${editor.isActive('orderedList')
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        title="Ordered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                </div>

                {/* AI Button - Separate but cohesive */}
                <button
                    onClick={() => onAiClick()}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#d8b131] hover:bg-[#D4AF37] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-150 font-medium text-sm"
                    title="AI Assistant"
                >
                    <Sparkle className="w-4 h-4" />
                    <span>{loading? "Thinking...":"AI"}</span>
                </button>
            </div>
        </div>
    )
}