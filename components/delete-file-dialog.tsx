"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function DeleteFileDialog({
    open,
    onOpenChange,
    fileId,
    fileName,
    onDeleted,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileId: string | null;
    fileName?: string | null;
    onDeleted?: () => void;
}) {
    const { user } = useUser();
    const deleteFile = useAction(api.fileStorage.DeleteFile);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!fileId) return;
        setLoading(true);
        try {
            await deleteFile({
                fileId,
                userEmail: user?.primaryEmailAddress?.emailAddress as string,
            });
            toast.success("File deleted");
            onOpenChange(false);
            onDeleted?.();
        } catch {
            toast.error("Failed to delete file. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete file?</DialogTitle>
                    <DialogDescription>
                        {fileName ? (
                            <>
                                &ldquo;{fileName}&rdquo; and all its notes and AI
                                answers will be permanently deleted. This action
                                cannot be undone.
                            </>
                        ) : (
                            <>
                                This file and all its notes and AI answers will
                                be permanently deleted. This action cannot be
                                undone.
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={loading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        type="button"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
