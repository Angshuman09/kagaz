import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Editor } from "@tiptap/react";
import { FileText, Trash2, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { DeleteFileDialog } from "@/components/delete-file-dialog";

export const WorkspaceHeader = ({
  fileName,
  editor,
}: {
  fileName: string;
  editor: Editor | null;
}) => {
  const router = useRouter();
  const { fileId } = useParams();
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { user } = useUser();
  const saveNote = useMutation(api.notes.saveNote);

  const HandleSave = async () => {
    setLoading(true);
    await saveNote({
      fileId: fileId as string,
      note: editor?.getHTML() as string,
      createBy: user?.primaryEmailAddress?.emailAddress as string,
    });
    setLoading(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="h-16 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: back + context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          aria-label="Go back"
          onClick={handleBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Undo2 size={17} />
        </button>
        <span className="hidden sm:inline text-sm font-medium text-slate-400">
          Workspace
        </span>
      </div>

      {/* Center: file chip */}
      <div className="flex min-w-0 items-center gap-2 rounded-lg bg-slate-100/80 px-3 py-1.5 ring-1 ring-slate-200/70">
        <FileText size={14} className="shrink-0 text-slate-400" />
        <span className="max-w-[36vw] sm:max-w-[40vw] truncate text-sm font-medium text-slate-700">
          {fileName}
        </span>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Delete file"
          onClick={() => setDeleteOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <Trash2 size={17} />
        </button>
        <Button
          onClick={HandleSave}
          disabled={loading}
          className="rounded-full px-5 shadow-sm"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatar: "w-10 h-10",
              userButtonTrigger: "p-1.5",
            },
          }}
        />
      </div>

      <DeleteFileDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        fileId={fileId as string}
        fileName={fileName}
        onDeleted={() => router.push("/dashboard")}
      />
    </header>
  );
};
