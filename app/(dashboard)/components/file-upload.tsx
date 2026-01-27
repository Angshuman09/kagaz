'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import { Loader2, Loader2Icon } from "lucide-react"
import { useUser } from "@clerk/clerk-react";

export function FileUpload({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
    const InsertFileEntry = useMutation(api.fileStorage.AddFileEntryToDB);
    const embedDocuments = useAction(api.myAction.ingest);
    const getFileUrl = useMutation(api.fileStorage.getFileUrl);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.files![0])
        setFile(e.target.files![0])
    }

    const onUpload = async () => {
        setLoading(true);
        const postUrl = await generateUploadUrl();
        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": file!.type },
            body: file!,
        });
        const { storageId } = await result.json();
        const fileId = uuidv4();
        console.log(storageId)
        const fileUrl = await getFileUrl({ storageId });
        const response = await InsertFileEntry({
            fileId: fileId,
            storageId: storageId,
            fileName: name ?? "untitled file name",
            createdBy: user?.primaryEmailAddress?.emailAddress as string,
            fileUrl: fileUrl as string
        })

        console.log(response)

        const apiResponse = await axios.get('api/pdf-loader?pdfUrl=' + fileUrl);
        console.log(apiResponse.data.result)
        const embedResponse = await embedDocuments({
            splitText: apiResponse.data.result,
            fileId: fileId
        })
        // console.log(embedResponse)
        setLoading(false);
        setOpen(false);
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Upload PDF file</DialogTitle>
                        <DialogDescription>
                            Upload your PDF file here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <Label htmlFor="file-1">File</Label>
                            <Input onChange={onFileSelect} placeholder="Upload PDF" id="file-1" name="file" type="file" accept=".pdf" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="name-1">File name</Label>
                            <Input onChange={(e) => setName(e.target.value)} placeholder="Enter file name" id="name-1" name="name" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button disabled={loading} onClick={onUpload} type="submit">
                            {loading ? <Loader2
                                className="flex justify-center items-center mr-2 h-4 w-4 animate-spin"
                            /> : 'Save'}</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}
