import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Undo, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";

export const WorkspaceHeader = ({ fileName, editor }: { fileName: string, editor: Editor | null }) => {
    const router = useRouter();
    const { fileId } = useParams();
    const [loading, setLoading] = useState(false);

    const {user} = useUser();
    const saveNote = useMutation(api.notes.saveNote);

    const HandleSave = async ()=>{
        setLoading(true);
        await saveNote({
            fileId: fileId as string,
            note: editor?.getHTML() as string,
            createBy: user?.primaryEmailAddress?.emailAddress as string,
        })
        setLoading(false);
    }

    const handleBack = () => {
        router.back();
    }

    return (
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Undo2 size={20} onClick={handleBack} className="bg-slate-200 w-10 h-10 p-2 rounded-full cursor-pointer"/>
                    <h1 className="text-lg font-semibold text-slate-900">Workspace</h1>
                </div>
                <div className="lg:hidden flex flex-col justify-center items-center">
                    <h1 className="text-lg font-semibold text-slate-900">Workspace</h1>
                </div>
            </div>

            <div className="font-bold text-slate-900">
                {fileName}
            </div>

            {/* Profile */}

            <div className="flex items-center gap-4">
                <Button onClick={HandleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                    <UserButton appearance={{
                        elements: {
                            userButtonAvatar: "w-12 h-12",  // Tailwind classes
                            userButtonTrigger: "p-2",
                        },
                    }} />
            </div>
        </header>
    )
}