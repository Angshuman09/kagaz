'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import { useEditor } from '@tiptap/react'
import { WorkspaceHeader } from '../../components/workspace-header'
import { PdfViewer } from '../../components/PdfViewer'
import { TextEditor } from '../../components/textEditor'
import { WorkspaceSkeleton } from '@/app/skeleton/workspace-skeleton'

import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle
} from 'react-resizable-panels'

const Workspace = () => {
  const { fileId } = useParams()

  const getFileRecord = useQuery(
    api.fileStorage.getFileData,
    fileId ? { fileId: fileId as string } : "skip"
  )

  const editor = useEditor({
        extensions: [
            StarterKit.configure({
                underline: false,
                link: false,
            }),
            Placeholder.configure({
                placeholder: 'Start writing your amazing document...',
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Highlight,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] px-8 py-6',
            },
        },
        content: '',
        immediatelyRender: false,
    })

  if (!fileId) {
    return <div>file not fount</div>
  }

  if (getFileRecord === undefined) {
    return <WorkspaceSkeleton />
  }

  if (getFileRecord.length === 0) {
    return <div>File not found</div>
  }

  const file = getFileRecord[0]

  return (
    <div className="flex flex-col h-screen">
      <WorkspaceHeader editor={editor} fileName={file.fileName} />

      <div className="flex-1 overflow-hidden p-4">
        <PanelGroup orientation="horizontal" className="h-full">
          <Panel defaultSize={50} minSize={20} className="h-full">
            <TextEditor editor={editor} />
          </Panel>

          <PanelResizeHandle className="w-2 cursor-col-resize" />

          <Panel defaultSize={50} minSize={20} className="h-full">
            <PdfViewer fileUrl={file.fileUrl} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

export default Workspace
