'use client'

import { useParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

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
    <div className="flex flex-col h-[calc(100vh-(--spacing(16)))]">
      <WorkspaceHeader />

      <div className="h-full overflow-hidden p-4">
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={50} minSize={20}>
            <TextEditor />
          </Panel>

          <PanelResizeHandle className="w-2 cursor-col-resize" />

          <Panel defaultSize={50} minSize={20}>
            <PdfViewer fileUrl={file.fileUrl} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

export default Workspace
